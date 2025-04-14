const express = require("express");
const router = express.Router();
const Users = require("../models/Users");
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../utils/appError");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/authmiddleware");
const allowedToUpdate = require("../middleware/allowedToUpdated");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs")
const multer = require("multer");

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    const fileName = `user-${Date.now()}.${ext}`;
    cb(null, fileName);
  },
});
const fileFilter = function(req, file, cb){
  const type = file.mimetype.split("/")[0];
  if(type === "image"){
    return cb(null,true)
  } else {
    return cb(appError.create("file must be an image",400,"fails"),false)
  }
}
const upload = multer({ storage: diskStorage , fileFilter });

router.get(
  "/",
  verifyToken,
  asyncWrapper(async (req, res) => {
    const limit = req.query.limit || 5;
    const page = req.query.page || 1;
    const skip = (page - 1) * limit;
    const users = await Users.find({}, { __v: false }).limit(limit).skip(skip);
    return res.json({ status: "success", data: { users: users } });
  })
);

router.post(
  "/register",
  upload.single("avatar"),
  asyncWrapper(async (req, res, next) => {
    const { firstName, email, password, avatar } = req.body;
    const oldUser = await Users.findOne({ email: email });
    if (oldUser) {
      const error = appError.create("Email has already been used", 400, "Fail");
      return next(error);
    } 
    const uploaded = await cloudinary.uploader.upload(req.file.path, {
      folder: "avatars", 
    });
    fs.unlinkSync(req.file.path)

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUsers = new Users({
      firstName,
      email,
      avatar : uploaded.secure_url, 
      password: hashedPassword,
    });
    const token = await jwt.sign(
      { email: newUsers.email, id: newUsers._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "60s" }
    );
    await newUsers.save();

    res.status(201).json({
      status: "success",
      data: { user: newUsers, token },
    });
  })
);

router.get(
  "/login",
  asyncWrapper(async (req, res, next) => {
    const { email, password } = req.body;
    const oldUser = await Users.findOne({ email: email });
    if (!oldUser) {
      const error = appError.create("email or password invalid", 400, "Fail");
      return next(error);
    }
    const isMatch = await bcrypt.compare(password, oldUser.password);
    if (!oldUser || !isMatch) {
      const error = appError.create("email or password invalid", 400, "Fail");
      return next(error);
    }
    const token = jwt.sign(
      { email: oldUser.email, id: oldUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "60s" }
    );

    return res.status(200).json({ message: "loggin successefly", token });
  })
);

router.patch(
  "/update/:userId",
  verifyToken,
  allowedToUpdate,
  asyncWrapper(async (req, res, next) => {
    const userId = req.params.userId;

    const userUpdate = await Users.findByIdAndUpdate(userId, req.body, {
      new: true,
    });

    if (!userUpdate) {
      return next(appError.create("User not found", 404, "fail"));
    }

    res.status(200).json({ message: "success" });
  })
);

module.exports = router;
