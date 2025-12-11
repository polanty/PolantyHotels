import {
  getAllBrands,
  updateBrand,
  deleteBrand,
  getOneBrand,
  createBrand,
} from "../../Controller/HotelController/HotelController.js";
import Brands from "../../Models/BrandsModel.js";

// Mock the Brands model
jest.mock("../../Models/BrandsModel.js");

describe("HotelController", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllBrands", () => {
    it("should return filtered brands successfully", async () => {
      const mockBrands = [{ name: "Brand1" }];
      Brands.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBrands),
      });

      await getAllBrands(req, res);

      expect(Brands.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: {
          data: { filteredBrands: mockBrands },
        },
      });
    });

    it("should handle errors", async () => {
      Brands.find.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error("DB Error")),
      });

      await getAllBrands(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "An error occurred while fetching hotels.",
      });
    });
  });

  describe("createBrand", () => {
    it("should create a brand successfully", async () => {
      const mockBrand = { name: "New Brand" };
      req.body = mockBrand;
      Brands.create.mockResolvedValue(mockBrand);

      await createBrand(req, res);

      expect(Brands.create).toHaveBeenCalledWith(mockBrand);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: {
          hotel: mockBrand,
        },
      });
    });

    it("should handle creation errors", async () => {
      req.body = { name: "New Brand" };
      Brands.create.mockRejectedValue(new Error("Creation failed"));

      await createBrand(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Creation failed",
      });
    });
  });

  describe("getOneBrand", () => {
    it("should return a brand successfully", async () => {
      const mockBrand = { _id: "123", name: "Brand1" };
      req.params.id = "123";
      Brands.findById.mockResolvedValue(mockBrand);

      await getOneBrand(req, res);

      expect(Brands.findById).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: {
          hotel: mockBrand,
        },
      });
    });

    it("should return error if brand not found", async () => {
      req.params.id = "123";
      Brands.findById.mockResolvedValue(null);

      await getOneBrand(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Hotel not found",
      });
    });

    it("should handle errors", async () => {
      req.params.id = "123";
      Brands.findById.mockRejectedValue(new Error("DB Error"));

      await getOneBrand(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "DB Error",
      });
    });
  });

  describe("updateBrand", () => {
    it("should update a brand successfully", async () => {
      const mockUpdatedBrand = { _id: "123", name: "Updated Brand" };
      req.params.id = "123";
      req.body = { name: "Updated Brand" };
      Brands.findByIdAndUpdate.mockResolvedValue(mockUpdatedBrand);

      await updateBrand(req, res);

      expect(Brands.findByIdAndUpdate).toHaveBeenCalledWith("123", req.body, {
        new: true,
        runValidators: true,
      });
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: {
          hotel: mockUpdatedBrand,
        },
      });
    });

    it("should return error for invalid updates", async () => {
      req.params.id = "123";
      req.body = { invalidField: "value" };

      await updateBrand(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "fail",
        message: "Invalid updates! You can only update name and description.",
      });
    });

    it("should handle update errors", async () => {
      req.params.id = "123";
      req.body = { name: "Updated" };
      Brands.findByIdAndUpdate.mockRejectedValue(new Error("Update failed"));

      await updateBrand(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "An error occurred while creating the hotel.",
      });
    });
  });

  describe("deleteBrand", () => {
    it("should delete a brand successfully", async () => {
      const mockBrand = { _id: "123", name: "Brand1" };
      req.params.id = "123";
      Brands.findByIdAndUpdate.mockResolvedValue(mockBrand);

      await deleteBrand(req, res);

      expect(Brands.findByIdAndUpdate).toHaveBeenCalledWith("123", {
        isActive: false,
      });
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: {
          brand: mockBrand,
        },
      });
    });

    it("should return error if brand not found", async () => {
      req.params.id = "123";
      Brands.findByIdAndUpdate.mockResolvedValue(null);

      await deleteBrand(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Hotel not found",
      });
    });

    it("should handle delete errors", async () => {
      req.params.id = "123";
      Brands.findByIdAndUpdate.mockRejectedValue(new Error("Delete failed"));

      await deleteBrand(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "An error occurred while deleting the hotel.",
      });
    });
  });
});
