class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }
  filter() {
    const queryObject = { ...this.queryString };
    const exclude = ["limit", "page", "sort", "fields", "keyword"];
    exclude.forEach((param) => delete queryObject[param]);
    // Filter with [gt,gte,lte,lt]
    // the shpae returned -----> { sold: { gte: '101' }, price: { lte: '15.99' } }
    // the shpae requierd -----> { sold: { '$gte': '101' }, price: { '$lte': '15.99' } }
    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(
      /\b(gt|gte|lte|lt)\b/g,
      (operand) => `$${operand}`
    );
    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));
    // console.log("this inside filter():", this);
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-createdAt");
    }
    return this;
  }
  limitFields() {
    if (this.queryString.fields) {
      // the shape returned fields = name,price,title
      // the shape requierd  = name price title
      const fields = this.queryString.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }
    return this;
  }
  search(modelName) {
    if (this.queryString.keyword) {
      let query = {};
      if (modelName === "Products") {
        query.$or = [
          { title: { $regex: this.queryString.keyword, $options: "i" } }, // i for case insensitive men --->MEN
          { description: { $regex: this.queryString.keyword, $options: "i" } }
        ];
      } else {
        query = { name: { $regex: this.queryString.keyword, $options: "i" } };
      }
      this.mongooseQuery = this.mongooseQuery.find(query);
    }
    return this;
  }
  paginate(countDocuments, populatePath) {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 10;
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(countDocuments / limit);
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    if (populatePath) {
      this.mongooseQuery = this.mongooseQuery.populate({
        path: populatePath,
        select: "name -_id"
      });
    }

    const pagination = {};
    pagination.currentPage = page;
    pagination.limit = limit;
    pagination.totalPages = totalPages;
    if (page > 1) {
      pagination.prevPage = page - 1;
    }
    if (page < totalPages) {
      pagination.nextPage = page + 1;
    }
    this.pagination = pagination;
    return this;
  }
}
module.exports = ApiFeatures;
