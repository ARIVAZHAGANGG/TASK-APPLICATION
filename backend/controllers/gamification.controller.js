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

        const newLevel = Math.floor(Math.sqrt(user.points / 100)) + 1;

        let levelUp = false;
        if (newLevel > oldLevel) {
            user.level = newLevel;
            levelUp = true;
            console.log(`🚀 User ${user.name} leveled up to ${newLevel}!`);

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
            totalTasksDone: completedTasksCount,
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
 * Generate and download a professional enterprise-grade PDF productivity report
 */
exports.downloadReport = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Import the score function at the top of the handler to ensure it's available
        let calculateActivityProductivityScore = (tasks) => 0;
        try {
            const taskCtrl = require('./task.controller');
            if (taskCtrl && taskCtrl.calculateActivityProductivityScore) {
                calculateActivityProductivityScore = taskCtrl.calculateActivityProductivityScore;
            }
        } catch (e) {
            console.error("Failed to load calculateActivityProductivityScore from task.controller:", e);
        }

        const role = (user.role || 'student').toUpperCase();

        // ─── DATA GATHERING ─────────────────────────────────────────────────────
        let kpiCards    = [];
        let perfMetrics = [];
        let tableRows   = [];
        let recentTasks = [];

        // Apply a safe limit to prevent memory/timeout issues on large accounts
        const MAX_TASKS = 200; 

        if (user.role === 'admin') {
            const allTasks   = await Task.find({}).populate('assignedByUserId','name').populate('assignedToUserId','name').limit(MAX_TASKS).lean();
            const totalUsers = await User.countDocuments({ role: { $in: ['student','mentor'] } });
            const completed  = allTasks.filter(t => t.completed).length;
            const pending    = allTasks.length - completed;
            const onTime     = allTasks.filter(t => {
                if (!t.completed) return false;
                if (!t.dueDate) return true;
                return new Date(t.completedAt || t.updatedAt) <= new Date(t.dueDate);
            }).length;
            
            const prod       = calculateActivityProductivityScore(allTasks);
            const compRate   = allTasks.length > 0 ? Math.round((completed/allTasks.length)*100) : 0;
            const onTimeRate = completed > 0 ? Math.round((onTime/completed)*100) : 0;

            kpiCards = [
                { title: 'TOTAL TASKS',    value: allTasks.length, sub: 'System Wide' },
                { title: 'COMPLETED',      value: completed,        sub: compRate + '% rate' },
                { title: 'PENDING',        value: pending,          sub: 'In pipeline' },
                { title: 'PRODUCTIVITY',   value: prod + '%',       sub: 'Activity index' },
            ];
            perfMetrics = [
                { label: 'Total Users (Mentor + Student)', value: String(totalUsers) },
                { label: 'Total Tasks Managed',            value: String(allTasks.length) },
                { label: 'Tasks Completed',                value: String(completed) },
                { label: 'Pending Tasks',                  value: String(pending) },
                { label: 'On-Time Completion Rate',        value: onTimeRate + '%' },
                { label: 'System Productivity Score',      value: prod + '%' },
            ];
            tableRows = [
                ['Total Tasks Assigned',   String(allTasks.length), String(allTasks.length), '100%'],
                ['Tasks Completed',        String(allTasks.length), String(completed),        compRate + '%'],
                ['On-Time Completion',     String(completed),        String(onTime),           onTimeRate + '%'],
                ['System Efficiency',      '85%',                    prod + '%',               (prod>0?Math.round((prod/85)*100):0) + '%'],
                ['Active Users',           '-',                      String(totalUsers),        '-'],
            ];
            recentTasks = [...allTasks].sort((a,b) => new Date(b.updatedAt)-new Date(a.updatedAt)).slice(0,6);

        } else if (user.role === 'mentor') {
            const assigned      = await Task.find({ assignedByUserId: user._id }).populate('assignedToUserId','name').limit(MAX_TASKS).lean();
            const studentsCount = await User.countDocuments({ role: 'student' });
            const completed     = assigned.filter(t => t.completed).length;
            const pending       = assigned.length - completed;
            const onTime        = assigned.filter(t => {
                if (!t.completed) return false;
                if (!t.dueDate) return true;
                return new Date(t.completedAt || t.updatedAt) <= new Date(t.dueDate);
            }).length;
            
            const prod       = calculateActivityProductivityScore(assigned);
            const compRate   = assigned.length > 0 ? Math.round((completed/assigned.length)*100) : 0;
            const onTimeRate = completed > 0 ? Math.round((onTime/completed)*100) : 0;

            kpiCards = [
                { title: 'TASKS ASSIGNED', value: assigned.length, sub: 'By you' },
                { title: 'COMPLETED',      value: completed,        sub: compRate + '% rate' },
                { title: 'PENDING',        value: pending,          sub: 'Not yet done' },
                { title: 'PRODUCTIVITY',   value: prod + '%',       sub: 'Activity index' },
            ];
            perfMetrics = [
                { label: 'Students Managed',        value: String(studentsCount) },
                { label: 'Tasks Assigned',          value: String(assigned.length) },
                { label: 'Tasks Completed',         value: String(completed) },
                { label: 'Task Completion Rate',    value: compRate + '%' },
                { label: 'On-Time Completion Rate', value: onTimeRate + '%' },
                { label: 'Mentor Productivity',     value: prod + '%' },
            ];
            tableRows = [
                ['Tasks Assigned',       String(assigned.length), String(assigned.length), '100%'],
                ['Tasks Completed',      String(assigned.length), String(completed),        compRate + '%'],
                ['On-Time Delivery',     String(completed),        String(onTime),           onTimeRate + '%'],
                ['Pending Tasks',        '0',                      String(pending),           '-'],
                ['Mentorship Quality',   '85%',                    prod + '%',                (prod>0?Math.round((prod/85)*100):0) + '%'],
            ];
            recentTasks = [...assigned].sort((a,b) => new Date(b.updatedAt)-new Date(a.updatedAt)).slice(0,6);

        } else {
            // Student
            const sQuery = {
                $or: [
                    { assignedToUserId: user._id },
                    { assignedTo: user._id },
                    { createdBy: user._id, assignedToUserId: { $exists: false } },
                    { createdBy: user._id, assignedToUserId: null },
                ]
            };
            const tasks      = await Task.find(sQuery).populate('assignedByUserId','name').limit(MAX_TASKS).lean();
            const completed  = tasks.filter(t => t.completed).length;
            const pending    = tasks.length - completed;
            const highPri    = tasks.filter(t => t.completed && (t.priority==='high'||t.priority==='critical')).length;
            const onTime     = tasks.filter(t => {
                if (!t.completed) return false;
                if (!t.dueDate) return true;
                return new Date(t.completedAt || t.updatedAt) <= new Date(t.dueDate);
            }).length;
            
            const prod       = calculateActivityProductivityScore(tasks);
            const compRate   = tasks.length > 0 ? Math.round((completed/tasks.length)*100) : 0;
            const onTimeRate = completed > 0 ? Math.round((onTime/completed)*100) : 0;

            kpiCards = [
                { title: 'TOTAL TASKS',  value: tasks.length, sub: 'Assigned to you' },
                { title: 'COMPLETED',    value: completed,    sub: compRate + '% rate' },
                { title: 'PENDING',      value: pending,      sub: 'Remaining' },
                { title: 'PRODUCTIVITY', value: prod + '%',   sub: 'Activity index' },
            ];
            perfMetrics = [
                { label: 'Total Tasks Assigned',          value: String(tasks.length) },
                { label: 'Tasks Completed',               value: String(completed) },
                { label: 'High Priority Tasks Completed', value: String(highPri) },
                { label: 'Pending Tasks',                 value: String(pending) },
                { label: 'On-Time Completion Rate',       value: onTimeRate + '%' },
                { label: 'Individual Productivity Score', value: prod + '%' },
            ];
            const allHighPri = tasks.filter(t=>t.priority==='high'||t.priority==='critical').length;
            tableRows = [
                ['Tasks Assigned',       String(tasks.length), String(tasks.length), '100%'],
                ['Tasks Completed',      String(tasks.length), String(completed),    compRate + '%'],
                ['High Priority Done',   String(allHighPri),   String(highPri),      allHighPri>0?Math.round((highPri/allHighPri)*100)+'%':'-'],
                ['On-Time Completion',   String(completed),    String(onTime),       onTimeRate + '%'],
                ['Performance Rating',   '80%',                prod + '%',           (prod>0?Math.round((prod/80)*100):0) + '%'],
            ];
            recentTasks = [...tasks].sort((a,b) => new Date(b.updatedAt)-new Date(a.updatedAt)).slice(0,6);
        }

        // ─── BUILD PDF ──────────────────────────────────────────────────────────
        const doc      = new PDFDocument({ margin: 50, size: 'A4' });
        const filename = 'Productivity_Report_' + role + '_' + new Date().toISOString().split('T')[0] + '.pdf';

        res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
        res.setHeader('Content-type', 'application/pdf');
        doc.pipe(res);

        const W        = doc.page.width;
        const L        = 50;
        const R        = W - 50;
        const contentW = R - L;

        // ── Helpers ────────────────────────────────────────────────────────────
        function sectionHeader(title) {
            doc.rect(L, doc.y, contentW, 22).fill('#1e293b');
            doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold')
               .text(title, L + 10, doc.y - 18, { width: contentW - 20 });
            doc.moveDown(1.5);
            doc.fillColor('#334155').font('Helvetica').fontSize(10);
        }

        function separator() {
            doc.moveTo(L, doc.y).lineTo(R, doc.y).lineWidth(0.5).stroke('#e2e8f0');
            doc.moveDown(0.8);
        }

        // ═══════════════════════════════════════════════════════════════════
        // HEADER
        // ═══════════════════════════════════════════════════════════════════
        const logoPath = path.join(__dirname, '../assets/bait_logo.png');
        if (fs.existsSync(logoPath)) {
            try {
                doc.image(logoPath, (W/2) - 30, doc.y, { width: 60, height: 60 });
                doc.moveDown(5);
            } catch (err) {
                console.warn("Logo drawing failed, skipping:", err.message);
            }
        }

        doc.fillColor('#0f172a').fontSize(17).font('Helvetica-Bold')
           .text('BANNARI AMMAN INSTITUTE OF TECHNOLOGY', { align: 'center' });
        doc.moveDown(0.2);
        doc.fillColor('#64748b').fontSize(9).font('Helvetica')
           .text('An Autonomous Institution  |  Accredited by NAAC with A+ Grade', { align: 'center' });
        doc.moveDown(0.8);

        // Title bar
        var titleBarY = doc.y;
        doc.rect(L, titleBarY, contentW, 32).fill('#1e3a8a');
        doc.fillColor('#ffffff').fontSize(15).font('Helvetica-Bold')
           .text('PRODUCTIVITY REPORT', L, titleBarY + 9, { width: contentW, align: 'center' });
        doc.y = titleBarY + 42;

        var dt = new Date();
        doc.fillColor('#64748b').fontSize(8.5).font('Helvetica')
           .text('Date of Emission: ' + dt.toLocaleDateString() + '   |   Time: ' + dt.toLocaleTimeString() + '   |   Role: ' + role, { align: 'center' });
        doc.moveDown(1);
        separator();

        // ═══════════════════════════════════════════════════════════════════
        // SECTION 1: COMMANDER IDENTITY
        // ═══════════════════════════════════════════════════════════════════
        sectionHeader('SECTION 1  —  COMMANDER IDENTITY');

        var idRows = [
            ['Full Name',          user.name || 'N/A'],
            ['Email Address',      user.email || 'N/A'],
            ['Institutional Role', role],
            ['Staff / Student ID', user.staffId || user.studentId || 'N/A'],
            ['Department',         user.department || 'N/A'],
        ];

        idRows.forEach(function(row) {
            var rowY = doc.y;
            doc.fillColor('#94a3b8').font('Helvetica-Bold').fontSize(8.5)
               .text(row[0], L + 4, rowY, { width: 155 });
            doc.fillColor('#0f172a').font('Helvetica').fontSize(10)
               .text(row[1], L + 165, rowY, { width: contentW - 165 });
            doc.moveDown(0.6);
        });
        doc.moveDown(0.4);
        separator();

        // ═══════════════════════════════════════════════════════════════════
        // SECTION 2: PRODUCTIVITY SUMMARY (KPI CARDS)
        // ═══════════════════════════════════════════════════════════════════
        sectionHeader('SECTION 2  —  PRODUCTIVITY SUMMARY');

        var cardColors   = ['#dbeafe','#dcfce7','#fef9c3','#fce7f3'];
        var borderColors = ['#3b82f6','#22c55e','#eab308','#ec4899'];
        var cardW = Math.floor((contentW - 18) / 4);
        var cardH = 66;
        var cardTopY = doc.y;

        kpiCards.forEach(function(card, i) {
            var cx = L + i * (cardW + 6);
            doc.rect(cx, cardTopY, cardW, cardH).fill(cardColors[i]);
            doc.rect(cx, cardTopY, 4, cardH).fill(borderColors[i]);

            doc.fillColor('#475569').fontSize(7.5).font('Helvetica-Bold')
               .text(card.title, cx + 8, cardTopY + 10, { width: cardW - 12 });
            doc.fillColor('#0f172a').fontSize(20).font('Helvetica-Bold')
               .text(String(card.value), cx + 8, cardTopY + 23, { width: cardW - 12 });
            doc.fillColor('#64748b').fontSize(7.5).font('Helvetica')
               .text(card.sub, cx + 8, cardTopY + 50, { width: cardW - 12 });
        });

        doc.y = cardTopY + cardH + 18;
        separator();

        // ═══════════════════════════════════════════════════════════════════
        // SECTION 3: PERFORMANCE METRICS
        // ═══════════════════════════════════════════════════════════════════
        sectionHeader('SECTION 3  —  PERFORMANCE METRICS');

        perfMetrics.forEach(function(m, i) {
            var rowY = doc.y;
            if (i % 2 === 0) doc.rect(L, rowY - 2, contentW, 18).fill('#f8fafc');
            doc.fillColor('#475569').font('Helvetica').fontSize(9.5)
               .text(m.label, L + 8, rowY, { width: contentW - 110 });
            doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10)
               .text(m.value, R - 95, rowY, { width: 88, align: 'right' });
            doc.moveDown(0.65);
        });
        doc.moveDown(0.4);
        separator();

        // ═══════════════════════════════════════════════════════════════════
        // SECTION 4: KEY PERFORMANCE METRICS TABLE
        // ═══════════════════════════════════════════════════════════════════
        sectionHeader('SECTION 4  —  KEY PERFORMANCE METRICS TABLE');

        var colW = [contentW*0.40, contentW*0.20, contentW*0.20, contentW*0.20];
        var colX = [L, L+colW[0], L+colW[0]+colW[1], L+colW[0]+colW[1]+colW[2]];
        var tHdrs = ['Metric', 'Target', 'Achieved', '% of Target'];

        // Header row
        doc.rect(L, doc.y, contentW, 20).fill('#1e3a8a');
        tHdrs.forEach(function(h, i) {
            doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold')
               .text(h, colX[i] + 4, doc.y - 17, { width: colW[i] - 8, align: i===0?'left':'center' });
        });
        doc.moveDown(1.2);

        tableRows.forEach(function(row, ri) {
            var rowY = doc.y;
            doc.rect(L, rowY - 2, contentW, 18).fill(ri%2===0?'#f1f5f9':'#ffffff');
            row.forEach(function(cell, i) {
                var pct = parseFloat(cell);
                var clr = (i===3 && !isNaN(pct)) ? (pct>=80?'#16a34a':pct>=50?'#ca8a04':'#dc2626') : '#334155';
                doc.fillColor(clr).font(i===0?'Helvetica':'Helvetica-Bold').fontSize(9)
                   .text(String(cell), colX[i]+4, rowY, { width: colW[i]-8, align: i===0?'left':'center' });
            });
            [colX[1],colX[2],colX[3]].forEach(function(x) {
                doc.moveTo(x, rowY-2).lineTo(x, rowY+16).lineWidth(0.3).stroke('#cbd5e1');
            });
            doc.moveDown(0.75);
        });

        doc.moveTo(L, doc.y).lineTo(R, doc.y).lineWidth(0.5).stroke('#cbd5e1');
        doc.moveDown(0.8);
        separator();

        // ═══════════════════════════════════════════════════════════════════
        // SECTION 5: RECENT TASK ACTIVITY
        // ═══════════════════════════════════════════════════════════════════
        sectionHeader('SECTION 5  —  RECENT TASK ACTIVITY');

        if (recentTasks.length > 0) {
            var tcW = [contentW*0.28, contentW*0.16, contentW*0.16, contentW*0.14, contentW*0.13, contentW*0.13];
            var tcX = [L];
            tcW.forEach(function(w,i){ tcX.push(tcX[i]+w); });
            var tHdrNames = ['Task Name','Assigned By','Assigned To','Assigned Date','Completion','Status'];

            // Mini header row
            doc.rect(L, doc.y, contentW, 16).fill('#e2e8f0');
            tHdrNames.forEach(function(h, i) {
                doc.fillColor('#475569').fontSize(7.5).font('Helvetica-Bold')
                   .text(h, tcX[i]+3, doc.y-13, { width: tcW[i]-6 });
            });
            doc.moveDown(0.8);

            recentTasks.forEach(function(task, ri) {
                var rowY = doc.y;
                if (ri%2===0) doc.rect(L, rowY-1, contentW, 20).fill('#f8fafc');

                var by   = task.assignedByUserId ? task.assignedByUserId.name : 'Self';
                var to   = task.assignedToUserId ? task.assignedToUserId.name : 'Self';
                var aD   = task.assignDate || task.createdAt;
                var cD   = task.completedAt || task.updatedAt;
                var aDStr = aD ? new Date(aD).toLocaleDateString() : '-';
                var cDStr = task.completed && cD ? new Date(cD).toLocaleDateString() : '-';
                var status     = task.completed ? 'DONE' : 'PENDING';
                var statusClr  = task.completed ? '#16a34a' : '#dc2626';

                var cells = [
                    { t: (task.title||'Untitled').slice(0,34), c:'#0f172a', f:'Helvetica-Bold' },
                    { t: (by || 'N/A').slice(0,18),  c:'#475569', f:'Helvetica' },
                    { t: (to || 'N/A').slice(0,18),  c:'#475569', f:'Helvetica' },
                    { t: aDStr,           c:'#64748b', f:'Helvetica' },
                    { t: cDStr,           c:'#64748b', f:'Helvetica' },
                    { t: status,          c: statusClr, f:'Helvetica-Bold' },
                ];

                cells.forEach(function(d,i) {
                    doc.fillColor(d.c).font(d.f).fontSize(8)
                       .text(String(d.t), tcX[i]+3, rowY+2, { width: tcW[i]-6 });
                });
                doc.moveDown(1.1);
            });
        } else {
            doc.fillColor('#94a3b8').font('Helvetica').fontSize(10)
               .text('No recent task activity found for this account.', { align: 'center' });
            doc.moveDown(1);
        }

        // ═══════════════════════════════════════════════════════════════════
        // FOOTER
        // ═══════════════════════════════════════════════════════════════════
        var footerY = doc.page.height - 58;
        doc.moveTo(L, footerY).lineTo(R, footerY).lineWidth(0.5).stroke('#cbd5e1');
        doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold')
           .text('TASK BITSATHY INTELLIGENCE UNIT', L, footerY + 7, { align: 'center', width: contentW });
        doc.fillColor('#64748b').fontSize(8).font('Helvetica')
           .text('Confidential — Productivity Tracking Platform', { align: 'center' });
        doc.fillColor('#2563eb').fontSize(8)
           .text('Contact: admin@bitsathy.ac.in', { align: 'center' });

        doc.end();

    } catch (error) {
        console.error('PDF Generation Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Failed to generate report', details: error.message });
        }
    }
};
