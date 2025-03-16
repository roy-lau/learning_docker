import { Schema } from "mongoose";
import dbClient from "../lib/MongooseClient.js";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$$/,
    },
    phone: {
      type: String,
      match: /^1[3-9]\d{9}$$/, // 中国手机号格式
    },
    password: {
      type: String,
      required: true,
    },
    avatar: String,
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    age: {
      type: Number,
      min: 1,
      max: 120,
    },
    status: {
      type: String,
      enum: ["active", "frozen"],
      default: "active",
    },
  },
  { timestamps: true }
);

// 安全字段过滤方法
userSchema.methods.filterSafeFields = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

export default dbClient.registerModel("User", userSchema);
