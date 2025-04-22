const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiErrors");
const ApiFeatures = require("../utils/ApiFeatures");

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);
    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }
    // Trigger "remove" event when update document
    document.remove();
    res.status(204).send();
  });

exports.getOne = (Model, populateOptions) =>
  asyncHandler(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    const document = await query;
    if (!document) {
      return next(
        new ApiError(`No document for this id ${req.params.id}`, 404)
      );
    }
    res.status(200).json({ data: document });
  });
exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findById(req.params.id);
    if (!document) {
      return next(
        new ApiError(`No document for this id ${req.params.id}`, 404)
      );
    }
    const updateData = {
      ...req.body,
      slug: req.body.name ? slugify(req.body.name) : document.slug
    };
    const documentUpdated = await Model.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
      // يجبر Mongoose على تطبيق الفاليديشنrunValidators
    );
    if (!documentUpdated) {
      return next(
        new ApiError(`No Document for this id ${req.params.id}`, 404)
      );
    }
    await documentUpdated.save();
    res.status(200).json({ data: documentUpdated });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const createDocument = await Model.create(req.body);
    res.status(201).json({ data: createDocument });
  });

exports.getAll = (Model, modelName = "", parentName = "") =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }
    const countDocuments = await Model.countDocuments(filter);
    const features = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .search(modelName)
      .paginate(countDocuments, parentName);
    const { mongooseQuery, pagination } = features;
    // Execute Query
    const allDocuments = await mongooseQuery;
    res.status(200).json({
      results: allDocuments.length,
      pagination,
      data: allDocuments
    });
  });
