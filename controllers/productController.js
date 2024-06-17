const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const path = require('path');
const cloudinary = require('cloudinary').v2;

const createProduct = async (req, res) => {
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};
const getAllProducts = async (req, res) => {
  const products = await Product.find({});

  res.status(StatusCodes.OK).json({ products, count: products.length });
};
const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findOne({ _id: productId }).populate('reviews');

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};
const updateProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};
const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }

  await product.remove();
  res.status(StatusCodes.OK).json({ msg: 'Success! Product removed.' });
};


const uploadImage = async (req, res) => {
  try {
    if (!req.files || (!req.files.image && !req.files.video)) {
      throw new CustomError.BadRequestError('No Image or Video Uploaded');
    }

    let file = req.files.image || req.files.video;

    // Check file type
    if (!file.mimetype.startsWith('image') && !file.mimetype.startsWith('video')) {
      throw new CustomError.BadRequestError('Please Upload Image or Video');
    }

    // Check file size
    const maxSize = 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      throw new CustomError.BadRequestError('Please upload file smaller than 1MB');
    }

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, { resource_type: "auto" });

    res.status(StatusCodes.OK).json({ url: result.secure_url });
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};


module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
