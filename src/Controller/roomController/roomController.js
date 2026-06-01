import Room from "../../Models/roomModel.js";
import Location from "../../Models/locationModel.js";
import Pricing from "../../Models/pricingModel.js";
import RoomTypes from "../../Models/room_typesModel.js";
import APIFeatures from "../../Utilities/apiFeatures.js";
import catchAsync from "../../Utilities/catchAsync.js";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.join(__dirname, "../../../uploads");
const roomUploadsRoot = path.join(uploadsRoot, "rooms");

const roomImageUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter(req, file, cb) {
    const allowed = /jpeg|jpg|png|webp/;
    const extIsValid = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeIsValid = allowed.test(file.mimetype);

    if (extIsValid && mimeIsValid) {
      cb(null, true);
      return;
    }

    cb(new Error("Only JPEG, PNG, and WEBP room images are allowed"));
  },
  limits: { fileSize: 5 * 1024 * 1024, files: 12 },
});

export const uploadRoomImages = roomImageUpload.array("images", 12);

function buildRoomImagePath(roomId, filename) {
  return `/uploads/rooms/${roomId}/${filename}`;
}

function buildRoomImageUrl(req, roomId, filename) {
  return `${req.protocol}://${req.get("host")}${buildRoomImagePath(
    roomId,
    filename,
  )}`;
}

function sanitizeFilename(filename) {
  const ext = path.extname(filename).toLowerCase();
  const base = path
    .basename(filename, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return `${base || "room"}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
}

async function saveRoomImages(roomId, files = []) {
  if (!files.length) return [];

  const roomFolder = path.join(roomUploadsRoot, String(roomId));
  await fs.mkdir(roomFolder, { recursive: true });

  const imagePaths = await Promise.all(
    files.map(async (file) => {
      const filename = sanitizeFilename(file.originalname);
      await fs.writeFile(path.join(roomFolder, filename), file.buffer);
      return buildRoomImagePath(roomId, filename);
    }),
  );

  return imagePaths;
}

async function getRoomImagePathsFromFolder(roomId) {
  const roomFolder = path.join(roomUploadsRoot, String(roomId));

  try {
    const files = await fs.readdir(roomFolder);

    return files
      .filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
      .map((file) => buildRoomImagePath(roomId, file));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

function toAbsoluteRoomImageUrls(req, imagePaths = []) {
  return imagePaths.map((imagePath) => {
    if (/^https?:\/\//i.test(imagePath)) return imagePath;
    return `${req.protocol}://${req.get("host")}${imagePath}`;
  });
}

export const createHotelRoom = catchAsync(async (req, res, next) => {
  const newRoom = await Room.create({ ...req.body, images: [] });
  const imagePaths = await saveRoomImages(newRoom._id, req.files);

  if (imagePaths.length > 0) {
    newRoom.images = imagePaths;
    await newRoom.save();
  }

  await Location.findByIdAndUpdate(newRoom.location_id, {
    $addToSet: { RoomRef: newRoom._id },
  });

  const roomResponse = newRoom.toObject();
  roomResponse.images = toAbsoluteRoomImageUrls(req, imagePaths);

  res.status(201).json({
    status: "success",
    data: {
      Rooms: [roomResponse],
    },
  });
});

export const getOneHotelRoom = catchAsync(async (req, res, next) => {
  const room = await Room.findById(req.params.id).populate("room_type_id");

  if (!room) {
    return res.status(404).json({
      status: "fail",
      message: "Room not found",
    });
  }

  const folderImagePaths = await getRoomImagePathsFromFolder(room._id);
  const imagePaths = folderImagePaths.length > 0 ? folderImagePaths : room.images;

  if (folderImagePaths.length > 0) {
    room.images = folderImagePaths;
    await room.save();
  }

  const roomResponse = room.toObject();
  roomResponse.images = toAbsoluteRoomImageUrls(req, imagePaths);

  res.status(200).json({
    status: "success",
    data: {
      room: roomResponse,
    },
  });
});

export const getAllHotelRooms = catchAsync(async (req, res, next) => {
  //BUILD THE QUERY

  //1A) Filtering to remove special query parameters

  //Object to handle all the API function
  //Filtering
  //sorting
  //pagination
  //limiting
  const apiFeatures = new APIFeatures(Room.find(), req.query)
    .defaultyQueryWithFilter()
    .sort()
    .pagination();

  //whatever the requeste is we must limit the return data for performance
  //i can use the .explain method to measure statistics
  // expecially when i need to index my model for optimized query
  const allRooms = await apiFeatures.query;

  const total = await Room.countDocuments(apiFeatures.filter);
  const totalPages = Math.ceil(total / apiFeatures.limit);

  res.status(200).json({
    status: "success",
    results: total,
    totalPages,
    currentPage: apiFeatures.page,
    data: {
      data: { allRooms },
    },
  });
});
