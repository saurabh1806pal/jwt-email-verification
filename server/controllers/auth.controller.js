const User = require("../models/user.model.js");
const transporter = require("../config/nodemailer.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { firstname, lastname, username, email, password } = req.body;
  if (!firstname || !lastname || !username || !email || !password) {
    return res
      .status(400)
      .json({ message: "All fields are required", success: false });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstname,
      lastname,
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Sending Welcome Email can be added here
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: newUser.email,
      subject: "Welcome to Our Service",
      text: `Hello ${newUser.firstname},\n\nWelcome to our service! We're glad to have you on board.\n\nBest regards,\nTeam`,
    };

    await transporter.sendMail(mailOptions);
    return res
      .status(201)
      .json({ message: "User registered successfully", success: true });
  } catch (error) {
    return res.status(400).json({ message: error.message, success: false });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required", success: false });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid email or password", success: false });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Invalid email or password", success: false });
    }

    // In case of successful login, generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "Login successful", success: true });
  } catch (error) {
    return res.status(400).json({ message: error.message, success: false });
  }
};

exports.logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res
      .status(200)
      .json({ message: "Logout successful", success: true });
  } catch (error) {
    return res.status(400).json({ message: error.message, success: false });
  }
};

exports.sendVerifyOtp = async (req, res) => {
  const email = req.user.email;
  if (!email) {
    return res
      .status(400)
      .json({ message: "Email is required", success: false });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }
    if (user.isAccountVerified) {
      return res
        .status(400)
        .json({ message: "User is already verified", success: false });
    }
    // Generate OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send OTP via email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Your Verification OTP",
      text: `Hello ${user.firstname},\n\nYour verification OTP is: ${otp}\n\nBest regards,\nTeam`,
    };

    await transporter.sendMail(mailOptions);
    return res
      .status(200)
      .json({ message: "OTP sent successfully", success: true });
  } catch (error) {
    return res.status(400).json({ message: error.message, success: false });
  }
};

exports.verifyAccount = async (req, res) => {
  const email = req.user.email; // ✅ from JWT
  const { otp } = req.body; // ✅ only OTP from body

  if (!otp) {
    return res.status(400).json({ message: "OTP is required", success: false });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }

    if (user.isAccountVerified) {
      return res
        .status(400)
        .json({ message: "User is already verified", success: false });
    }

    //  VERY IMPORTANT DEBUG LINE (temporarily)
    // console.log("Saved OTP:", user.verifyOtp);
    // console.log("Received OTP:", otp);
    // console.log("Expires At:", user.verifyOtpExpires);
    // console.log("Now:", Date.now());

    // console.log("==== OTP DEBUG START ====");
    // console.log("Email from JWT:", email);
    // console.log("OTP received (req.body):", otp, typeof otp);
    // console.log("OTP saved (DB):", user.verifyOtp, typeof user.verifyOtp);
    // console.log("OTP expires at:", user.verifyOtpExpires);
    // console.log("Current time:", Date.now());
    // console.log("==== OTP DEBUG END ====");

    if (String(user.verifyOtp) !== otp || user.verifyOtpExpires < Date.now()) {
      return res
        .status(400)
        .json({ message: "Invalid or expired OTP", success: false });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpires = "";
    await user.save();

    return res
      .status(200)
      .json({ message: "Account verified successfully", success: true });
  } catch (error) {
    return res.status(400).json({ message: error.message, success: false });
  }
};

exports.isAuthenticated = async (req, res) => {
  try {
    return res
      .status(200)
      .json({ message: "User is authenticated", success: true });
  } catch (error) {
    return res.status(400).json({ message: error.message, success: false });
  }
};

exports.sendResetOtp = async (req, res) => {
  // Implementation for sending password reset OTP
  const email = req.body.email;
  if (!email) {
    return res
      .status(400)
      .json({ message: "Email is required", success: false });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }
    // Generate OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send OTP via email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Your Password Reset OTP",
      text: `Hello ${user.firstname},\n\nYour password reset OTP is: ${otp}\n\nBest regards,\nTeam`,
    };

    await transporter.sendMail(mailOptions);
    return res
      .status(200)
      .json({ message: "OTP sent successfully", success: true });
  } catch (error) {
    return res.status(400).json({ message: error.message, success: false });
  }
};

exports.resetPassword = async (req, res) => {
  // Implementation for resetting password using OTP
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      message: "Email, OTP, and new password are required",
      success: false,
    });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }
    // console.log("==== OTP DEBUG START ====");
    // console.log("Email from JWT:", email);
    // console.log("OTP received (req.body):", otp, typeof otp);
    // console.log("OTP saved (DB):", user.resetOtp, typeof user.resetOtp);
    // console.log("OTP expires at:", user.resetOtpExpires);
    // console.log("Current time:", Date.now());
    // console.log("==== OTP DEBUG END ====");

    if (String(user.resetOtp) !== otp || user.resetOtpExpires < Date.now()) {
      return res
        .status(400)
        .json({ message: "Invalid or expired OTP", success: false });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpires = "";
    await user.save();
    return res
      .status(200)
      .json({ message: "Password reset successfully", success: true });
  } catch (error) {
    return res.status(400).json({ message: error.message, success: false });
  }
};
