import { getAllHotels } from "./HotelController";
import Location from "../../Models/locationModel";
import APIFeatures from "../../Utilities/apiFeatures";

// Mock the Models to simulate the Location and APIfeatures functionality
jest.mock("../../Models/locationModel");
jest.mock("../../Utilities/apiFeatures");
