const User = require('../models/user.model');
const Achievement = require('../models/Achievement');
const Task = require('../models/Task');
const notificationController = require('./notification.controller');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

/**
 * Reward logic constants
 */
const POINTS_CONFIG = {
    TASK_COMPLETED: 10,
    FOCUS_SESSION: 50,
    DAILY_LOGIN: 5,
    STREAK_BONUS_BASE: 5,
};

/**
 * Handle point rewards and progression
 */
exports.rewardPoints = async (userId, action, metadata = {}) => {
    try {
        const user = await User.findById(userId);
        if (!user) return null;

        let pointsToAdd = 0;
        let achievementMessage = '';

        switch (action) {
            case 'task_completed':
                pointsToAdd = POINTS_CONFIG.TASK_COMPLETED;
                user.totalTasksDone += 1;
                // Add streak bonus if streak > 1
                if (user.streak > 1) {
                    pointsToAdd += Math.min(user.streak * POINTS_CONFIG.STREAK_BONUS_BASE, 50);
                }
                break;
            case 'focus_session_completed':
                pointsToAdd = POINTS_CONFIG.FOCUS_SESSION;
                break;
            case 'daily_login':
                pointsToAdd = POINTS_CONFIG.DAILY_LOGIN;
                break;
            default:
                pointsToAdd = metadata.points || 0;
        }

        const oldLevel = user.level || 1;
        user.points += pointsToAdd;

        // Level formula: Level = floor(sqrt(totalPoints / 100)) + 1
        // Level 1: 0-99
        // Level 2: 100-399
        // Level 3: 400-899
        // Level 4: 900-1599
        const newLevel = Math.floor(Math.sqrt(user.points / 100)) + 1;

        let levelUp = false;
        if (newLevel > oldLevel) {
            user.level = newLevel;
            levelUp = true;
            console.log(`🚀 User ${user.name} leveled up to ${newLevel}!`);

            // Notify user of level up
            await notificationController.createNotification(
                userId,
                'level_up',
                '🏆 Level Up!',
                `Congratulations! You've reached Level ${newLevel}. Your productivity is soaring!`,
                '/dashboard'
            );
        }

        await user.save();

        return {
            pointsAdded: pointsToAdd,
            totalPoints: user.points,
            level: user.level,
            levelUp
        };

    } catch (error) {
        console.error('Gamification Error:', error);
        return null;
    }
};

/**
 * Get user's gamification stats (for dashboard)
 */
exports.getStats = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('achievements.achievementId')
            .select('points level streak longestStreak achievements totalTasksDone');

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Calculate XP for current and next level
        // currentLevelXP = (level - 1)^2 * 100
        // nextLevelXP = level^2 * 100
        const currentLevelStartXP = Math.pow(user.level - 1, 2) * 100;
        const nextLevelXP = Math.pow(user.level, 2) * 100;
        const xpInCurrentLevel = user.points - currentLevelStartXP;
        const xpRequiredForNextLevel = nextLevelXP - currentLevelStartXP;
        const progressPercentage = xpRequiredForNextLevel > 0 ? (xpInCurrentLevel / xpRequiredForNextLevel) * 100 : 0;
        const totalTasks = await Task.countDocuments({ createdBy: req.user.id });
        const completedTasksCount = await Task.countDocuments({ createdBy: req.user.id, completed: true });

        res.json({
            level: user.level,
            points: user.points,
            totalTasksDone: completedTasksCount, // Overriding with actual DB count instead of all-time counter
            totalTasks: totalTasks,
            streak: user.streak,
            longestStreak: user.longestStreak,
            progress: {
                currentXP: xpInCurrentLevel,
                requiredXP: xpRequiredForNextLevel,
                percentage: Math.round(progressPercentage),
                nextLevel: user.level + 1
            },
            achievements: user.achievements
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
/**
 * Reward points specifically for arcade games
 */
exports.rewardGamePoints = async (req, res) => {
    try {
        const { score } = req.body;
        // Game reward formula: score / 10 = XP (capped at 50 per session)
        const pointsToAdd = Math.min(Math.floor(score / 10), 50);

        if (pointsToAdd <= 0) {
            return res.json({ success: true, pointsAdded: 0 });
        }

        const result = await exports.rewardPoints(req.user.id, 'arcade_game', { points: pointsToAdd });

        res.json({
            success: true,
            pointsAdded: pointsToAdd,
            totalPoints: result.totalPoints,
            level: result.level,
            levelUp: result.levelUp
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Generate and download a professional PDF productivity report
 */
exports.downloadReport = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Query for missions
        let query = { completed: true };
        if (req.user.role !== 'admin') {
            query.createdBy = req.user.id;
        }

        const tasks = await Task.find(query)
            .populate('assignedToUserId', 'name staffId email')
            .populate('assignedByUserId', 'name staffId email')
            .limit(req.user.role === 'admin' ? 20 : 5)
            .sort({ updatedAt: -1 });

        const doc = new PDFDocument({ margin: 50 });
        let filename = `BitTask_Report_${user.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

        res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // Header - Logo (single centered logo)
        const logoPathSeal = path.join(__dirname, '../assets/bait_logo.png');
        const pageWidth = doc.page.width;
        const logoY = 40;

        if (fs.existsSync(logoPathSeal)) {
            // Draw logo centered
            doc.image(logoPathSeal, (pageWidth / 2) - 50, logoY, { width: 100, height: 100 });

            // Academic Header Text
            doc.y = logoY + 115;
            doc.fillColor('#1e293b')
               .fontSize(16)
               .font('Helvetica-Bold')
               .text('BANNARI AMMAN INSTITUTE OF TECHNOLOGY', { align: 'center' });
            
            doc.moveDown(0.2);
            doc.fillColor('#64748b')
               .fontSize(10)
               .font('Helvetica')
               .text('An Autonomous Institution | Accredited by NAAC with A+ Grade', { align: 'center' });
            
            doc.moveDown(1.5);
            doc.fillColor('#0f172a')
               .fontSize(24)
               .font('Helvetica-Bold')
               .text('PRODUCTIVITY REPORT', { align: 'center', characterSpacing: 1 });
            
            doc.moveDown(0.5);
            doc.fillColor('#64748b')
               .fontSize(10)
               .font('Helvetica')
               .text(`Date of Emission: ${new Date().toLocaleDateString()} | Time: ${new Date().toLocaleTimeString()}`, { align: 'center' });
            
            // Decorative line
            doc.moveDown(1);
            doc.moveTo(100, doc.y).lineTo(pageWidth - 100, doc.y).lineWidth(1).stroke('#e2e8f0');
            doc.moveDown(2);
        }

        // User/System Identity
        const sectionTitle = req.user.role === 'admin' ? 'GLOBAL SYSTEM AUDIT' : 'COMMANDER IDENTITY';
        doc.fillColor('#1e293b').fontSize(14).text(sectionTitle, { tracking: 2 });
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#e2e8f0');
        doc.moveDown();

        doc.fontSize(12).fillColor('#334155').text(`Name: ${user.name}`);
        doc.text(`Email: ${user.email}`);
        doc.text(`Operational Role: ${user.role.toUpperCase()}`);
        if (user.staffId) doc.text(`Staff ID: ${user.staffId}`);
        doc.moveDown(2);

        // Performance Metrics
        const metricsTitle = req.user.role === 'admin' ? 'GLOBAL PERFORMANCE METRICS' : 'PERFORMANCE METRICS';
        doc.fillColor('#1e293b').fontSize(14).text(metricsTitle, { tracking: 2 });
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#e2e8f0');
        doc.moveDown();

        doc.fontSize(12).fillColor('#334155');
        
        let globalQuery = { completed: true };
        if (req.user.role !== 'admin') {
            globalQuery.createdBy = req.user.id;
        }
        
        const totalQuery = req.user.role === 'admin' ? {} : { createdBy: req.user.id };
        const totalTasksFull = await Task.countDocuments(totalQuery);
        const completedTasksCount = await Task.countDocuments({ ...totalQuery, completed: true });
        
        let productivityScore = 0;
        if (totalTasksFull > 0) {
            productivityScore = Math.round((completedTasksCount / totalTasksFull) * 100);
            if (productivityScore > 100) productivityScore = 100;
        }

        if (req.user.role !== 'admin') {
            doc.text(`Combat Streak: ${user.streak || 0} ${user.streak === 1 ? 'Day' : 'Days'}`);
        }
        doc.text(`System Success Rate: ${productivityScore}%`);
        doc.text(`Total Missions Accomplished: ${completedTasksCount || 0}`);
        doc.moveDown(2);

        // Missions Debrief
        const debriefTitle = req.user.role === 'admin' ? 'SYSTEM-WIDE MISSION DEBRIEF' : 'RECENT MISSION DEBRIEF';
        doc.fillColor('#1e293b').fontSize(14).text(debriefTitle, { tracking: 2 });
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#e2e8f0');
        doc.moveDown();

        if (tasks.length > 0) {
            tasks.forEach((task, index) => {
                doc.fontSize(11).fillColor('#1e293b').font('Helvetica-Bold').text(`${index + 1}. ${task.title}`);
                doc.font('Helvetica').fontSize(9).fillColor('#475569');
                
                // Show assignment details for admins or everyone if available
                const assignedTo = task.assignedToUserId ? `${task.assignedToUserId.name} (ID: ${task.assignedToUserId.staffId || 'N/A'})` : 'Self';
                const assignedBy = task.assignedByUserId ? task.assignedByUserId.name : 'System/Self';
                
                doc.text(`   Assigned To: ${assignedTo}`);
                doc.text(`   Assigned By: ${assignedBy}`);
                
                const assignDate = task.assignDate || task.createdAt;
                const completedAt = task.completedAt || task.updatedAt;
                
                const assignStr = new Date(assignDate).toLocaleDateString() + ' ' + new Date(assignDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const completeStr = new Date(completedAt).toLocaleDateString() + ' ' + new Date(completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                doc.text(`   Assigned At: ${assignStr}`);
                doc.fillColor('#10b981').text(`   Successfully Finished At: ${completeStr}`);
                doc.fillColor('#475569');

                doc.moveDown(1);
            });
        } else {
            doc.fontSize(12).fillColor('#94a3b8').text('No recent mission logs recorded in the system.');
        }

        // Footer
        const bottom = doc.page.height - 100;
        doc.fontSize(10).fillColor('#6366f1').text('TASK BITSATHY INTELLIGENCE UNIT', 50, bottom, { align: 'center' });
        doc.fontSize(8).fillColor('#94a3b8').text('Confidential - Personal Productivity Analysis', { align: 'center' });

        doc.end();

    } catch (error) {
        console.error('PDF Generation Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Failed to generate report' });
        }
    }
};
