import qs from "qs";

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  defaultyQueryWithFilter() {
    // console.log(this.query, this.queryString);

    //1A) Filtering to remove special query parameters
    let queryObj = { ...this.queryString };

    queryObj = qs.parse(queryObj);

    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let updatedQuery = JSON.stringify(queryObj);

    // const regex = /\b(lt|lte|gt|gte)\b/g;
    const regexResult = updatedQuery.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    updatedQuery = JSON.parse(regexResult);

    let returnedQuery = this.query.find(updatedQuery);

    // Save filter for later use in count
    this.filter = updatedQuery;

    return returnedQuery;
  }

  sort() {
    if (this.queryString.sort) {
      console.log(this.queryString.sort.split(",").join(" "));

      let sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.find().sort(`${sortBy}`);
    } else {
      this.query = this.query.find().sort("-created_at");
    }

    return this;
  }
}

export default APIFeatures;
