const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const controller = require('../controllers/workspace.controller');

// Workspace management
router.post('/', auth, (req, res) => controller.createWorkspace(req, res));
router.get('/', auth, (req, res) => controller.getUserWorkspaces(req, res));
router.get('/:id', auth, (req, res) => controller.getWorkspace(req, res));

// Member management
router.post('/:id/members', auth, (req, res) => controller.inviteMember(req, res));
router.delete('/:id/members/:memberId', auth, (req, res) => controller.removeMember(req, res));
router.put('/:id/members/:memberId/role', auth, (req, res) => controller.updateMemberRole(req, res));

// Switch workspace
router.post('/:id/switch', auth, (req, res) => controller.switchWorkspace(req, res));

module.exports = router;
