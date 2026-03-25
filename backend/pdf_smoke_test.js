/**
 * Standalone PDF layout smoke test — no MongoDB needed
 * This renders the same 5 sections as the real downloadReport function
 */
const PDFDocument = require('pdfkit');
const fs = require('fs');

function generateTestPDF(role, outputPath) {
    const user = { name: 'Test User', email: 'test@bitsathy.ac.in', role };
    const roleLabel = role.toUpperCase();

    const metrics = {
        admin:   { m1: 'Tasks Managed: 45', m2: 'Total Users: 12', m3: 'Reports Reviewed: 45', m4: 'System Productivity: 72%' },
        mentor:  { m1: 'Students Managed: 8', m2: 'Tasks Assigned: 20', m3: 'Tasks Reviewed: 15', m4: 'Mentor Productivity: 63%' },
        student: { m1: 'Tasks Completed: 3', m2: 'High Priority Done: 1', m3: 'On-Time: 2', m4: 'Productivity Score: 71.43%' }
    }[role];

    const cards = [
        { title: 'TOTAL TASKS', value: role === 'admin' ? 45 : role === 'mentor' ? 20 : 3 },
        { title: 'COMPLETED', value: role === 'admin' ? 32 : role === 'mentor' ? 15 : 3 },
        { title: 'PENDING',   value: role === 'admin' ? 13 : role === 'mentor' ? 5  : 0 },
        { title: 'PRODUCTIVITY', value: role === 'admin' ? '72%' : role === 'mentor' ? '63%' : '71.43%' }
    ];

    const tableRows = {
        admin:   [['System Efficiency','85%','72%','85%'], ['Completion Rate','90%','71%','-'], ['Overdue','<10%','29%','-']],
        mentor:  [['Student Completion','80%','75%','-'], ['Review Turnaround','100%','N/A','-'], ['Mentorship Quality','85%','63%','74%']],
        student: [['Execution Ratio','100%','100%','-'], ['On-Time Delivery','95%','67%','-'], ['Performance Rating','80%','71.43%','89%']]
    }[role];

    const recentTasks = [
        { title: 'Complete Assignment 1', completed: true, priority: 'high', completedAt: new Date() },
        { title: 'Submit Lab Report',     completed: true, priority: 'medium', completedAt: new Date() },
        { title: 'Review Peer Notes',     completed: false, priority: 'low',  completedAt: null }
    ];

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(fs.createWriteStream(outputPath));

    const pageWidth = doc.page.width;

    // HEADER
    doc.fillColor('#1e293b').fontSize(16).font('Helvetica-Bold')
       .text('BANNARI AMMAN INSTITUTE OF TECHNOLOGY', { align: 'center' });
    doc.moveDown(0.2);
    doc.fillColor('#64748b').fontSize(10).font('Helvetica')
       .text('Autonomous Institution | NAAC A+', { align: 'center' });
    doc.moveDown(1.5);
    doc.fillColor('#0f172a').fontSize(22).font('Helvetica-Bold')
       .text('PRODUCTIVITY REPORT', { align: 'center', characterSpacing: 1 });
    doc.moveDown(0.5);
    const dt = new Date();
    doc.fillColor('#64748b').fontSize(10).font('Helvetica')
       .text(`Date of Emission: ${dt.toLocaleDateString()}   |   Time: ${dt.toLocaleTimeString()}`, { align: 'center' });
    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(pageWidth - 50, doc.y).lineWidth(1).stroke('#e2e8f0');
    doc.moveDown(2);

    // SECTION 1
    doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text('SECTION 1: IDENTITY', { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(11).font('Helvetica').fillColor('#334155');
    doc.text('Name:  ' + user.name, 50);
    doc.text('Email:  ' + user.email, 50);
    doc.text('Role:   ' + roleLabel, 50);
    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(pageWidth - 50, doc.y).stroke('#f1f5f9');
    doc.moveDown(2);

    // SECTION 2
    doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text('SECTION 2: PERFORMANCE METRICS', { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(11).font('Helvetica').fillColor('#334155');
    doc.text(metrics.m1, 50);
    doc.text(metrics.m2, 50);
    doc.text(metrics.m3, 50);
    doc.text(metrics.m4, 50);
    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(pageWidth - 50, doc.y).stroke('#f1f5f9');
    doc.moveDown(2);

    // SECTION 3: CARDS
    doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text('SECTION 3: PRODUCTIVITY SUMMARY CARDS', { align: 'center' });
    doc.moveDown(1.5);
    let startY = doc.y, startX = 50;
    const boxWidth = 110, boxHeight = 65, spacing = 18;
    cards.forEach(function(card) {
        doc.roundedRect(startX, startY, boxWidth, boxHeight, 4).fillAndStroke('#ffffff', '#cbd5e1');
        doc.fillColor('#475569').fontSize(9).font('Helvetica-Bold');
        doc.text(card.title, startX, startY + 12, { width: boxWidth, align: 'center' });
        doc.fillColor('#0f172a').fontSize(22).font('Helvetica-Bold');
        doc.text(String(card.value), startX, startY + 30, { width: boxWidth, align: 'center' });
        startX += boxWidth + spacing;
    });
    doc.y = startY + boxHeight + 30;
    doc.moveTo(50, doc.y).lineTo(pageWidth - 50, doc.y).stroke('#f1f5f9');
    doc.moveDown(2);

    // SECTION 4: TABLE
    doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text('SECTION 4: DETAILED METRICS TABLE', { align: 'center' });
    doc.moveDown(1.5);
    let tableY = doc.y;
    const colWidths = [180, 100, 100, 100];
    const headers = ['Metric', 'Target', 'Achieved', '% of Target'];
    let tx = 50;
    doc.fillColor('#1e293b').fontSize(10).font('Helvetica-Bold');
    headers.forEach(function(h, i) {
        doc.text(h, tx + colWidths.slice(0,i).reduce(function(a,b){ return a+b; },0), tableY);
    });
    doc.moveTo(tx, tableY + 15).lineTo(pageWidth - 50, tableY + 15).stroke('#cbd5e1');
    tableY += 25;
    doc.font('Helvetica').fillColor('#334155');
    tableRows.forEach(function(row) {
        row.forEach(function(cell, i) {
            doc.text(String(cell), tx + colWidths.slice(0,i).reduce(function(a,b){ return a+b; },0), tableY);
        });
        doc.moveTo(tx, tableY + 15).lineTo(pageWidth - 50, tableY + 15).stroke('#f1f5f9');
        tableY += 22;
    });
    doc.y = tableY + 20;
    doc.moveTo(50, doc.y).lineTo(pageWidth - 50, doc.y).stroke('#f1f5f9');
    doc.moveDown(2);

    // SECTION 5: ACTIVITY
    doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text('SECTION 5: ACTIVITY SUMMARY', { align: 'center' });
    doc.moveDown(1.5);
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#334155').text('Recent Tasks & Submission Behavior:', 50);
    doc.moveDown(0.5);
    recentTasks.forEach(function(task, idx) {
        var taskStatus = task.completed ? '[COMPLETED]' : '[PENDING]';
        var dStr = new Date(task.completedAt || new Date()).toLocaleDateString();
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e293b');
        doc.text((idx + 1) + '. ' + task.title + '  ' + taskStatus);
        doc.fontSize(9).font('Helvetica').fillColor('#64748b');
        doc.text('   Priority: ' + task.priority.toUpperCase() + ' | Recorded: ' + dStr);
        doc.moveDown(0.5);
    });
    doc.moveDown(3);

    // FOOTER
    var bottom = doc.page.height - 70;
    doc.moveTo(50, bottom - 15).lineTo(pageWidth - 50, bottom - 15).stroke('#e2e8f0');
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#0f172a')
       .text('TASK BITSATHY INTELLIGENCE UNIT', 50, bottom, { align: 'center' });
    doc.fontSize(8).font('Helvetica').fillColor('#64748b')
       .text('Confidential - Productivity Tracking Platform', { align: 'center' });
    doc.moveDown(0.2);
    doc.fillColor('#2563eb').text('Contact: admin@bitsathy.ac.in', { align: 'center' });

    doc.end();
    console.log('Generated: ' + outputPath);
}

generateTestPDF('admin',   './test_admin_report.pdf');
generateTestPDF('mentor',  './test_mentor_report.pdf');
generateTestPDF('student', './test_student_report.pdf');
