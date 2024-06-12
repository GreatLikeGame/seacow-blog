import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

export const test = (req, res) => {
  res.json({ message: "Api is working" });
};

export const updateUser = async (req, res, next) => {
  // console.log("userid " + req.user.id);
  // console.log("id" + req.params.userId);
  //做验证

  if (req.user.id !== req.params.userId) {
    return next(errorHandler(403, "you are not allowed to update this user"));
  }
  // console.log(123);
  if (req.body.password) {
    if (req.body.password.length < 6) {
      return next(
        errorHandler(400, "password should be at least 6 characters")
      );
    }
    req.body.password = bcryptjs.hashSync(req.body.password, 10);
  }
  if (req.body.username) {
    if (req.body.username.length < 7 || req.body.username.length > 20) {
      return next(
        errorHandler(400, "username should be at between 7 and 20 characters")
      );
    }
    if (req.body.username.includes(" ")) {
      return next(errorHandler(400, "username should not contain spaces"));
    }
    if (req.body.username !== req.body.username.toLowerCase()) {
      return next(errorHandler(400, "username should be in lowercase"));
    }
    if (!req.body.username.match(/^[a-zA-z0-9]+$/)) {
      return next(
        errorHandler(400, "username should contain only letters and numbers")
      );
    }
  }
  try {
    const updateUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          profilePicture: req.body.profilePicture,
          password: req.body.password,
        },
      },
      { new: true }
    );
    const { password, ...rest } = updateUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.userId) {
    return next(errorHandler(403, "you are not allowed to delete this user"));
  }
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json("user has been deleted");
  } catch (error) {
    next(error);
  }
};

export const signout = (req, res, next) => {
  try {
    res.clearCookie("access_token").status(200).json("signout successful");
  } catch (error) {
    next(error);
  }
};
