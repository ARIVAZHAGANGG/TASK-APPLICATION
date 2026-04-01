const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const axios = require("axios");

/* ---------------- REGISTER ---------------- */
exports.register = async (req, res) => {
  try {
    const { name, email, password, rememberMe, role, staffId } = req.body;
    console.log("🔹 Auth: Registration Attempt:", email);

    if (!name || !email || !password) {
      console.log("❌ Registration Failed: Missing fields");
      return res.status(400).json({ message: "All fields required" });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const userData = {
      name,
      email,
      password,
      role: role || "student"
    };

    if (role === 'mentor' || role === 'admin') {
      if (!staffId) {
        return res.status(400).json({ message: "Staff ID is required for mentors and admins" });
      }
      userData.staffId = staffId;
    }

    const user = await User.create(userData);

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: rememberMe ? "30d" : "1d" }
    );

    // Set secure cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User Registered Successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Registration Error:", error.message);
    if (error.name === 'MongooseServerSelectionError' || error.message.includes('connect')) {
      return res.status(503).json({ message: "Database connection failed. Please check IP whitelist." });
    }
    res.status(500).json({ message: error.message });
  }
};


/* ---------------- LOGIN ---------------- */
exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe, role } = req.body;
    console.log(`🔹 Auth: Login Attempt for: [${email}]`);
    console.log(`🔹 Auth: Password provided length: ${password?.length || 0}`);

    /* ---- EMAIL DOMAIN RESTRICTION ---- */
    const ADMIN_EMAIL  = "admin@bitsathy.ac.in";
    const MENTOR_EMAIL = "sakthi.@bitsathy.ac.in";
    const COLLEGE_DOMAIN = "@bitsathy.ac.in";
    if (!email || !email.endsWith(COLLEGE_DOMAIN)) {
      return res.status(403).json({ message: "Access restricted. Use your college email ID." });
    }
    /* ---------------------------------- */

    const user = await User.findOne({ email });

    if (!user) {
      console.log(`❌ User not found for email: [${email}]`);
      return res.status(404).json({ message: "Email not registered" });
    }

    const isMatch = await user.matchPassword(password);
    console.log(`🔹 Password Match: ${isMatch}`);

    if (!isMatch) {
      console.log("❌ Password does not match");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: rememberMe ? "30d" : "1d" }
    );

    // Set secure cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Login Error:", error.message);
    if (error.name === 'MongooseServerSelectionError' || error.message.includes('connect')) {
      return res.status(503).json({ message: "Database connection failed. Please check IP whitelist." });
    }
    res.status(500).json({ message: error.message });
  }
};



const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

/* ---------------- FORGOT PASSWORD ---------------- */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // URL to Frontend Reset Page
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please go to this link to reset your password:</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Request",
        message,
      });

      res.status(200).json({ success: true, data: "Email Sent" });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ message: "Email could not be sent" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- RESET PASSWORD ---------------- */
exports.resetPassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid Token" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(201).json({
      success: true,
      message: "Password Reset Success. Please login with your new password.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- GOOGLE LOGIN ---------------- */
exports.googleLogin = async (req, res) => {
  try {
    const { token, rememberMe, role } = req.body;
    console.log("🔹 Google Login Attempt initialized");
    console.log("🔹 Received Token Length:", token ? token.length : "No Token");

    // Verify Access Token & Get User Info
    const googleRes = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`
    );

    console.log("🔹 Google API Response:", googleRes.data);

    const { name, email, picture } = googleRes.data;

    /* ---- EMAIL DOMAIN RESTRICTION (Google Login) ---- */
    const COLLEGE_DOMAIN = "@bitsathy.ac.in";
    if (!email || !email.endsWith(COLLEGE_DOMAIN)) {
      return res.status(403).json({ message: "Access restricted. Use your college email ID." });
    }
    /* ------------------------------------------------- */

    let user = await User.findOne({ email });

    if (!user) {
      console.log("🔹 User not found, creating new user...");
      // Create user without password for Google Auth
      user = await User.create({
        name,
        email,
        password: Math.random().toString(36).slice(-10), // Random placeholder
        avatar: picture,
      });
      console.log("🔹 New user created:", user._id);
    } else {
      console.log("🔹 User found:", user._id);
    }

    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: rememberMe ? "30d" : "1d" }
    );

    // Set secure cookie
    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Google Login Successful",
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Google Auth Error:", error.message);
    if (error.response) {
      console.error("❌ Google API Error Data:", error.response.data);
    }
    res.status(500).json({ message: "Google authentication failed: " + error.message });
  }
};

/* ---------------- GET PROFILE ---------------- */

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Dynamic stats calculation
    const Task = require("../models/Task");
    const totalTasks = await Task.countDocuments({
      $or: [
        { createdBy: req.user.id },
        { assignedToUserId: req.user.id }
      ]
    });
    const completedTasks = await Task.countDocuments({
      $or: [
        { createdBy: req.user.id },
        { assignedToUserId: req.user.id }
      ],
      completed: true
    });
    const pendingTasks = totalTasks - completedTasks;

    // Productivity Score calculation (simple version: % completed)
    const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Convert to plain object and add stats
    const profile = user.toJSON();
    profile.stats = {
      totalTasks,
      completedTasks,
      pendingTasks,
      productivityScore: user.productivityScore || productivityScore,
      streak: user.streak || 0,
    };
    profile.role = user.role;
    profile.staffId = user.staffId;

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- UPDATE DETAILS ---------------- */
exports.updateDetails = async (req, res) => {
  try {
    const { name, email, preferences, staffId } = req.body;

    // Find user by ID
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    if (name) user.name = name;

    if (preferences) {
      user.preferences = {
        ...user.preferences,
        ...preferences
      };
    }

    // Handle email update logic (check if taken)
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    if (staffId && (user.role === 'mentor' || user.role === 'admin')) {
      user.staffId = staffId;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- UPDATE PASSWORD ---------------- */
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

