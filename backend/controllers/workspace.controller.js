const Workspace = require('../models/Workspace');
const User = require('../models/user.model');
const Task = require('../models/Task');

// Create workspace
exports.createWorkspace = async (req, res) => {
    try {
        const { name, description } = req.body;

        const workspace = await Workspace.create({
            name,
            description,
            ownerId: req.user.id,
            members: []
        });

        // Update user's current workspace
        await User.findByIdAndUpdate(req.user.id, {
            currentWorkspace: workspace._id
        });

        res.status(201).json(workspace);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all workspaces for user
exports.getUserWorkspaces = async (req, res) => {
    try {
        const workspaces = await Workspace.find({
            $or: [
                { ownerId: req.user.id },
                { 'members.userId': req.user.id }
            ],
            isActive: true
        }).populate('ownerId', 'name email avatar');

        res.json(workspaces);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get workspace by ID
exports.getWorkspace = async (req, res) => {
    try {
        const workspace = await Workspace.findById(req.params.id)
            .populate('ownerId', 'name email avatar')
            .populate('members.userId', 'name email avatar');

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        // Check if user is a member
        if (!workspace.isMember(req.user.id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(workspace);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Invite member to workspace
exports.inviteMember = async (req, res) => {
    try {
        const { email, role = 'member' } = req.body;
        const workspace = await Workspace.findById(req.params.id);

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        // Check if requester has permission
        const requesterRole = workspace.getMemberRole(req.user.id);
        if (!['admin', 'manager'].includes(requesterRole)) {
            return res.status(403).json({ message: 'Only admins/managers can invite members' });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already a member
        if (workspace.isMember(user._id)) {
            return res.status(400).json({ message: 'User is already a member' });
        }

        workspace.members.push({
            userId: user._id,
            role
        });

        await workspace.save();

        res.json({
            message: 'Member invited successfully',
            workspace
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove member from workspace
exports.removeMember = async (req, res) => {
    try {
        const { memberId } = req.params;
        const workspace = await Workspace.findById(req.params.id);

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        // Only admin can remove members
        const requesterRole = workspace.getMemberRole(req.user.id);
        if (requesterRole !== 'admin') {
            return res.status(403).json({ message: 'Only admins can remove members' });
        }

        workspace.members = workspace.members.filter(
            m => m.userId.toString() !== memberId
        );

        await workspace.save();

        res.json({
            message: 'Member removed successfully',
            workspace
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update member role
exports.updateMemberRole = async (req, res) => {
    try {
        const { memberId } = req.params;
        const { role } = req.body;
        const workspace = await Workspace.findById(req.params.id);

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        // Only admin can change roles
        if (workspace.getMemberRole(req.user.id) !== 'admin') {
            return res.status(403).json({ message: 'Only admins can change roles' });
        }

        const member = workspace.members.find(
            m => m.userId.toString() === memberId
        );

        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        member.role = role;
        await workspace.save();

        res.json({
            message: 'Role updated successfully',
            workspace
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Switch current workspace
exports.switchWorkspace = async (req, res) => {
    try {
        const workspace = await Workspace.findById(req.params.id);

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        if (!workspace.isMember(req.user.id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await User.findByIdAndUpdate(req.user.id, {
            currentWorkspace: workspace._id
        });

        res.json({
            message: 'Workspace switched successfully',
            workspace
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = exports;
