import qs from "qs";

// helper: recursively lowercase string values in an object
function lowercaseValues(obj) {
  if (obj == null) return obj;

  if (typeof obj === "string") {
    // exact match but case-insensitive
    return { $regex: `^${obj}$`, $options: "i" };
  }

  if (Array.isArray(obj)) return obj.map(lowercaseValues);

  if (typeof obj === "object") {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = lowercaseValues(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  defaultyQueryWithFilter() {
    // 1) copy and parse query string
    let queryObj = { ...this.queryString };
    queryObj = qs.parse(queryObj);

    // 2) remove excluded fields
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 3) lowercase all string values for consistent comparison
    queryObj = lowercaseValues(queryObj);

    // 4) convert operators like gte/lt to $gte/$lt
    let updatedQuery = JSON.stringify(queryObj);
    const regexResult = updatedQuery.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`,
    );
    updatedQuery = JSON.parse(regexResult);

    this.query = this.query.find(updatedQuery);
    this.filter = updatedQuery;

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      console.log(this.queryString.sort.split(",").join(" "));

      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.find().sort(`${sortBy}`);
    } else {
      this.query = this.query.find().sort("-created_at");
    }

    return this;
  }

  pagination() {
    const page = parseInt(this.queryString.page) || 1;
    const limit = parseInt(this.queryString.limit) || 5;
    const skip = (page - 1) * limit;

    //Pagination on the routes below
    //skip function provided by MongoDb
    this.query = this.query.skip(skip).limit(limit);
    this.limit = limit; // save limit for later use
    this.page = page;

    console.log("Got here");
    return this;
  }
}

export default APIFeatures;
