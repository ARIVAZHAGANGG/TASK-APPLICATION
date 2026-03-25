const router = require("express").Router();
const { register, login, googleLogin, forgotPassword, resetPassword, getProfile, updateDetails, updatePassword } = require("../controllers/auth.controller");
const auth = require("../middleware/auth.middleware");

router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resetToken", resetPassword);
router.get("/profile", auth, getProfile);
router.put("/updatedetails", auth, updateDetails);
router.put("/updatepassword", auth, updatePassword);

// Health check to debug login environment
router.get("/health", (req, res) => {
    console.log("🔹 Auth Health Check Hit");
    res.json({
        status: "up",
        googleClientId: process.env.GOOGLE_CLIENT_ID ? "PRESENT" : "MISSING",
        jwtSecret: process.env.JWT_SECRET ? "PRESENT" : "MISSING",
        nodeEnv: process.env.NODE_ENV || "development"
    });
});

module.exports = router;
