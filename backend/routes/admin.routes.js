const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const adminController = require("../controllers/admin.controller");

router.get("/staff", auth, roleMiddleware("admin"), (req, res) => adminController.getStaffMembers(req, res));
router.get("/students", auth, roleMiddleware("admin", "mentor"), (req, res) => adminController.getStudents(req, res));
router.get("/tasks", auth, roleMiddleware("admin"), (req, res) => adminController.getAllTasks(req, res));
router.get("/activity", auth, roleMiddleware("admin"), (req, res) => adminController.getStaffActivity(req, res));
router.put("/students/:id/department", auth, roleMiddleware("admin", "mentor"), (req, res) => adminController.updateStudentDepartment(req, res));

module.exports = router;
