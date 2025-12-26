// __tests__/HotelController.test.js (or wherever you keep tests)

import {
  getAllHotels,
  createHotel,
  getOneHotel,
  updateHotel,
  deleteHotel,
} from "./HotelController.js";

import Location from "../../Models/locationModel.js";
import APIFeatures from "../../Utilities/apiFeatures.js";
import AppError from "../../Utilities/globalErrorCatcher.js";

jest.mock("../../Models/locationModel.js");
jest.mock("../../Utilities/apiFeatures.js");

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("HotelController", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      body: {},
    };
    res = createMockRes();
    next = jest.fn();
    jest.clearAllMocks();
  });

  // ---------- getAllHotels ----------

  describe("getAllHotels", () => {
    it("should return hotels with pagination metadata", async () => {
      req.query = { page: "2", limit: "10" };

      const mockHotels = [{ name: "Hotel One" }, { name: "Hotel Two" }];

      const apiFeaturesInstance = {
        defaultyQueryWithFilter: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        pagination: jest.fn().mockReturnThis(),
        query: Promise.resolve(mockHotels),
        filter: { city: "London" },
        limit: 10,
        page: 2,
      };

      APIFeatures.mockImplementation(() => apiFeaturesInstance);

      Location.countDocuments.mockResolvedValue(25);

      await getAllHotels(req, res, next);

      expect(APIFeatures).toHaveBeenCalledWith(Location.find(), req.query);
      expect(apiFeaturesInstance.defaultyQueryWithFilter).toHaveBeenCalled();
      expect(apiFeaturesInstance.sort).toHaveBeenCalled();
      expect(apiFeaturesInstance.pagination).toHaveBeenCalled();
      expect(Location.countDocuments).toHaveBeenCalledWith(
        apiFeaturesInstance.filter
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        results: 25,
        totalPages: Math.ceil(25 / apiFeaturesInstance.limit),
        currentPage: apiFeaturesInstance.page,
        data: {
          data: { allHotels: mockHotels },
        },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors from APIFeatures query to next", async () => {
      const apiFeaturesInstance = {
        defaultyQueryWithFilter: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        pagination: jest.fn().mockReturnThis(),
        query: Promise.reject(new Error("Query failed")),
        filter: {},
        limit: 10,
        page: 1,
      };

      APIFeatures.mockImplementation(() => apiFeaturesInstance);

      await getAllHotels(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  // ---------- createHotel ----------

  describe("createHotel", () => {
    it("should create a hotel successfully", async () => {
      const mockHotel = { name: "Hotel A" };
      req.body = mockHotel;

      Location.create.mockResolvedValue(mockHotel);

      await createHotel(req, res, next);

      expect(Location.create).toHaveBeenCalledWith({ ...mockHotel });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: {
          Hotel: [mockHotel],
        },
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next on creation error", async () => {
      req.body = { name: "Hotel A" };
      Location.create.mockRejectedValue(new Error("Create failed"));

      await createHotel(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  // ---------- getOneHotel ----------

  describe("getOneHotel", () => {
    it("should return a hotel successfully", async () => {
      const mockHotel = { _id: "123", name: "Hotel A" };
      req.params.id = "123";

      Location.findById.mockResolvedValue(mockHotel);

      await getOneHotel(req, res, next);

      expect(Location.findById).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: {
          hotel: mockHotel,
        },
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next with AppError when hotel not found", async () => {
      req.params.id = "123";
      Location.findById.mockResolvedValue(null);

      await getOneHotel(req, res, next);

      expect(Location.findById).toHaveBeenCalledWith("123");
      expect(next).toHaveBeenCalledWith(
        new AppError("Hotel not found 💥", 404)
      );
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should call next on DB error", async () => {
      req.params.id = "123";
      Location.findById.mockRejectedValue(new Error("DB error"));

      await getOneHotel(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  // ---------- updateHotel ----------

  describe("updateHotel", () => {
    it("should update a hotel successfully for allowed fields", async () => {
      const mockUpdatedHotel = {
        _id: "123",
        name: "Updated",
        address: "New Address",
      };

      req.params.id = "123";
      req.body = { name: "Updated", address: "New Address" };

      Location.findByIdAndUpdate.mockResolvedValue(mockUpdatedHotel);

      await updateHotel(req, res, next);

      expect(Location.findByIdAndUpdate).toHaveBeenCalledWith("123", req.body, {
        new: true,
        runValidators: true,
      });
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: {
          hotel: mockUpdatedHotel,
        },
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next with AppError for invalid updates", async () => {
      req.params.id = "123";
      req.body = { rating: 5, invalidField: "x" }; // not allowed by your allowedUpdates

      await updateHotel(req, res, next);

      expect(Location.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(
        new AppError(
          "Invalid updates! You can only update name and address.",
          400
        )
      );
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should call next on DB error during update", async () => {
      req.params.id = "123";
      req.body = { name: "Updated" };

      Location.findByIdAndUpdate.mockRejectedValue(new Error("Update failed"));

      await updateHotel(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  // ---------- deleteHotel ----------

  describe("deleteHotel", () => {
    it("should soft-delete a hotel successfully", async () => {
      const mockHotel = { _id: "123", name: "Hotel A", isActive: false };

      req.params.id = "123";
      Location.findByIdAndUpdate.mockResolvedValue(mockHotel);

      await deleteHotel(req, res, next);

      expect(Location.findByIdAndUpdate).toHaveBeenCalledWith("123", {
        isActive: false,
      });
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: {
          hotel: mockHotel,
        },
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next with AppError if hotel not found", async () => {
      req.params.id = "123";
      Location.findByIdAndUpdate.mockResolvedValue(null);

      await deleteHotel(req, res, next);

      expect(Location.findByIdAndUpdate).toHaveBeenCalledWith("123", {
        isActive: false,
      });
      expect(next).toHaveBeenCalledWith(new AppError("Hotel not found.", 500));
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should call next on DB error during delete", async () => {
      req.params.id = "123";
      Location.findByIdAndUpdate.mockRejectedValue(new Error("Delete failed"));

      await deleteHotel(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
