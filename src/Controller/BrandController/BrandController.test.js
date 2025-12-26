// src/Controller/BrandController/BrandController.test.js

import {
  getAllBrands,
  createBrand,
  getOneBrand,
  updateBrand,
  deleteBrand,
} from "./BrandController.js";

import Brands from "../../Models/BrandsModel.js";
import APIFeatures from "../../Utilities/apiFeatures.js";
import AppError from "../../Utilities/globalErrorCatcher.js";

// Mock dependencies
jest.mock("../../Models/BrandsModel.js");
jest.mock("../../Utilities/apiFeatures.js");

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("BrandController", () => {
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

  // ---------- getAllBrands ----------

  describe("getAllBrands", () => {
    it("should return brands with pagination metadata", async () => {
      req.query = { page: "2", limit: "10" };

      const mockBrands = [{ name: "Brand1" }, { name: "Brand2" }];

      // mock Brands.find() to return a "query" placeholder
      const mockQuery = { some: "query" };
      Brands.find = jest.fn().mockReturnValue(mockQuery);

      // fake APIFeatures instance
      const apiFeaturesInstance = {
        defaultyQueryWithFilter: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        pagination: jest.fn().mockReturnThis(),
        query: Promise.resolve(mockBrands),
        filter: { isActive: true },
        limit: 10,
        page: 2,
      };

      APIFeatures.mockImplementation(() => apiFeaturesInstance);

      Brands.countDocuments.mockResolvedValue(25);

      await getAllBrands(req, res, next);

      expect(Brands.find).toHaveBeenCalled();
      expect(APIFeatures).toHaveBeenCalledWith(mockQuery, req.query);
      expect(apiFeaturesInstance.defaultyQueryWithFilter).toHaveBeenCalled();
      expect(apiFeaturesInstance.sort).toHaveBeenCalled();
      expect(apiFeaturesInstance.pagination).toHaveBeenCalled();
      expect(Brands.countDocuments).toHaveBeenCalledWith(
        apiFeaturesInstance.filter
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        results: 25,
        totalPages: Math.ceil(25 / apiFeaturesInstance.limit),
        currentPage: apiFeaturesInstance.page,
        data: {
          data: { allHotels: mockBrands },
        },
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next on query error", async () => {
      const mockQuery = { some: "query" };
      Brands.find = jest.fn().mockReturnValue(mockQuery);

      const apiFeaturesInstance = {
        defaultyQueryWithFilter: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        pagination: jest.fn().mockReturnThis(),
        query: Promise.reject(new Error("DB error")),
        filter: {},
        limit: 10,
        page: 1,
      };

      APIFeatures.mockImplementation(() => apiFeaturesInstance);

      await getAllBrands(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  // ---------- createBrand ----------

  describe("createBrand", () => {
    it("should create a brand successfully", async () => {
      const mockBrand = { name: "New Brand" };
      req.body = mockBrand;

      Brands.create.mockResolvedValue(mockBrand);

      await createBrand(req, res, next);

      expect(Brands.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: {
          hotel: mockBrand,
        },
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next on creation error", async () => {
      req.body = { name: "New Brand" };
      Brands.create.mockRejectedValue(new Error("Creation failed"));

      await createBrand(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  // ---------- getOneBrand ----------

  describe("getOneBrand", () => {
    it("should return a brand successfully", async () => {
      const mockBrand = { _id: "123", name: "Brand1" };
      req.params.id = "123";

      Brands.findById.mockResolvedValue(mockBrand);

      await getOneBrand(req, res, next);

      expect(Brands.findById).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: {
          hotel: mockBrand,
        },
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next with AppError when brand not found", async () => {
      req.params.id = "123";
      Brands.findById.mockResolvedValue(null);

      await getOneBrand(req, res, next);

      expect(Brands.findById).toHaveBeenCalledWith("123");
      expect(next).toHaveBeenCalledWith(
        new AppError("Hotel not found 💥", 404)
      );
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should call next on DB error", async () => {
      req.params.id = "123";
      Brands.findById.mockRejectedValue(new Error("DB error"));

      await getOneBrand(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  // ---------- updateBrand ----------

  describe("updateBrand", () => {
    it("should update a brand successfully for allowed fields", async () => {
      const mockUpdatedBrand = {
        _id: "123",
        name: "Updated",
        description: "Desc",
      };

      req.params.id = "123";
      req.body = { name: "Updated", description: "Desc" };

      Brands.findByIdAndUpdate.mockResolvedValue(mockUpdatedBrand);

      await updateBrand(req, res, next);

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
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next with AppError for invalid updates", async () => {
      req.params.id = "123";
      req.body = { invalidField: "value" }; // not in ["name", "description"]

      await updateBrand(req, res, next);

      expect(Brands.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(
        new AppError(
          "Invalid updates! You can only update name and description.",
          400
        )
      );
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should call next on DB error during update", async () => {
      req.params.id = "123";
      req.body = { name: "Updated" };

      Brands.findByIdAndUpdate.mockRejectedValue(new Error("Update failed"));

      await updateBrand(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  // ---------- deleteBrand ----------

  describe("deleteBrand", () => {
    it("should soft-delete a brand successfully", async () => {
      const mockBrand = { _id: "123", name: "Brand1", isActive: false };

      req.params.id = "123";
      Brands.findByIdAndUpdate.mockResolvedValue(mockBrand);

      await deleteBrand(req, res, next);

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
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next with AppError if brand not found", async () => {
      req.params.id = "123";
      Brands.findByIdAndUpdate.mockResolvedValue(null);

      await deleteBrand(req, res, next);

      expect(Brands.findByIdAndUpdate).toHaveBeenCalledWith("123", {
        isActive: false,
      });
      expect(next).toHaveBeenCalledWith(new AppError("Hotel not found.", 500));
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should call next on DB error during delete", async () => {
      req.params.id = "123";
      Brands.findByIdAndUpdate.mockRejectedValue(new Error("Delete failed"));

      await deleteBrand(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
