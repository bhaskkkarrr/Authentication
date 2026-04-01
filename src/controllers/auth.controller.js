import userModel from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import sessionModel from "../models/session.model.js";
import { sendEmail } from "../services/email.service.js";
import { generateHtmlForOtp, generateOtp } from "../utils/utils.js";
import otpModel from "../models/otp.model.js";

export async function registerUser(req, res) {
  const { username, email, password } = req.body;

  const isAlreadyRegistered = await userModel.findOne({
    $or: [{ email }, { username }],
  });

  if (isAlreadyRegistered) {
    res.status(409).json({ message: "User already exist" });
  }

  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  const user = await userModel.create({
    username,
    email,
    password: hashedPassword,
  });

  const otp = generateOtp();
  const otpHTML = generateHtmlForOtp(otp);

  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
  await otpModel.create({ email, user: user._id, otpHash });

  await sendEmail(email, "OTP verification", `Your OTP is ${otp}`, otpHTML);

  res.status(201).json({
    message: "User registered successfully",
    user: {
      username: user.username,
      email: user.email,
      verified: user.verified,
    },
  });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(400).json({ success: false, message: "User not found" });
  }

  if (!user.verified) {
    return res
      .status(400)
      .json({ success: false, message: "Email not verified yet" });
  }
  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  const isValidPassword = hashedPassword === user.password;

  if (!isValidPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid password" });
  }
  const refreshToken = jwt.sign({ id: user._id }, config.JWT_SECRET, {
    expiresIn: "7d",
  });
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await sessionModel.create({
    user: user._id,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const accessToken = jwt.sign(
    { id: user._id, sessionId: session._id },
    config.JWT_SECRET,
    { expiresIn: "10m" },
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    message: "Logged in successfully",
    accessToken,
    user: {
      username: user.username,
      email: user.email,
      verified: user.verified,
    },
  });
}

export async function getAccessToken(req, res) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized. Access denied" });
  }
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  const session = await sessionModel.findOne({
    refreshTokenHash,
    revoked: false,
  });
  if (!session) {
    return res.status(400).json({ success: false, message: "Invalid token" });
  }
  const decoded = jwt.verify(refreshToken, config.JWT_SECRET);
  console.log("Decoded user", decoded);

  const accessToken = jwt.sign({ id: decoded.id }, config.JWT_SECRET, {
    expiresIn: "15m",
  });

  const newRefreshToken = jwt.sign({ id: decoded.id }, config.JWT_SECRET, {
    expiresIn: "7d",
  });

  const newRefreshTokenHash = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  session.refreshTokenHash = newRefreshTokenHash;
  await session.save();
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res
    .status(201)
    .json({ success: true, message: "Access token refreshed", accessToken });
}

export async function logout(req, res) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(402).json({
      success: false,
      message: "Token not found. Access denied",
    });
  }

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await sessionModel.findOne({
    refreshTokenHash,
    revoked: false,
  });

  if (!session) {
    return res.status(400).json({ success: false, message: "Invalid token" });
  }

  session.revoked = true;
  await session.save();
  res.clearCookie("refreshToken");
  res.status(200).json({ success: true, message: "Logout successful" });
}

export async function logoutall(req, res) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res
      .status(400)
      .json({ success: false, message: "Access denied, no token found" });
  }
  const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

  await sessionModel.updateMany(
    {
      user: decoded.id,
      revoked: false,
    },
    { revoked: true },
  );
  res.clearCookie("refreshToken");
  res
    .status(200)
    .json({ success: true, message: "Logged out from all devices" });
}

export async function verifyEmail(req, res) {
  const { otp, email } = req.body;
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

  const otpVerify = await otpModel.findOne({ otpHash, email });

  if (!otpVerify) {
    return res.status(400).json({ success: false, message: "Innvalid OTP" });
  }

  const user = await userModel.findByIdAndUpdate(otpVerify.user, {
    verified: true,
  });

  await otpModel.deleteMany({ user: otpVerify.user });

  return res.status(200).json({
    success: true,
    message: "OTP verified successfully",
    user: {
      username: user.username,
      email: user.email,
      verified: user.verified,
    },
  });
}
