const cron = require('node-cron');
const Task = require('../models/Task');
const sendEmail = require('../utils/sendEmail');

const initReminderCron = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            console.log(`⏰ [Reminder Cron] Checking at ${now.toISOString()} (${now.toLocaleString()})`);

            // Find tasks that are due for reminder
            const tasks = await Task.find({
                reminderEnabled: true,
                reminderSent: false,
                reminderDate: { $lte: now },
                completed: false
            }).populate('createdBy', 'name email');

            if (tasks.length > 0) {
                console.log(`⏰ [Reminder Cron] Found ${tasks.length} tasks due for reminder.`);
            } else {
                // Periodically log that it's running fine
                if (now.getSeconds() < 10) {
                    console.log(`⏰ [Reminder Cron] Heartbeat: Service is active, 0 tasks due.`);
                }
            }

            for (const task of tasks) {
                if (!task.createdBy || !task.createdBy.email) continue;

                console.log(`🔔 Processing reminder for task: ${task.title} (User: ${task.createdBy.email})`);

                // 1. Send Email
                const emailMessage = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
                        <h1 style="color: #4f46e5; margin-bottom: 16px;">Task Reminder 🔔</h1>
                        <p>Hi ${task.createdBy.name},</p>
                        <p>Your task <strong>"${task.title}"</strong> is due now.</p>
                        ${task.description ? `<p style="color: #64748b;">${task.description}</p>` : ''}
                        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;">
                        <a href="${process.env.FRONTEND_URL}/tasks" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Tasks</a>
                    </div>
                `;

                try {
                    await sendEmail({
                        email: task.createdBy.email,
                        subject: `🔔 Reminder: ${task.title}`,
                        message: emailMessage
                    });
                    console.log(`✅ Email sent for: ${task.title}`);
                } catch (emailError) {
                    console.error(`❌ Email failed for ${task.id}:`, emailError.message);
                }

                // 2. Send SMS (Placeholder for Twilio)
                if (task.smsEnabled && task.phoneNumber) {
                    try {
                        console.log(`📱 [SMS Placeholder] Sending to ${task.phoneNumber}: Reminder for "${task.title}"`);
                        // await twilioClient.messages.create({...})
                    } catch (smsError) {
                        console.error(`❌ SMS failed for ${task.id}:`, smsError.message);
                    }
                }

                // 3. Handle Recurrence
                if (task.recurrence && task.recurrence !== 'none') {
                    const nextDate = new Date(task.reminderDate);

                    if (task.recurrence === 'daily') nextDate.setDate(nextDate.getDate() + 1);
                    else if (task.recurrence === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
                    else if (task.recurrence === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);

                    task.reminderDate = nextDate;
                    task.reminderSent = false; // Reset for next time
                    console.log(`🔄 Task "${task.title}" rescheduled for ${nextDate.toLocaleString()}`);
                } else {
                    task.reminderSent = true;
                }

                await task.save();
            }
        } catch (error) {
            console.error('❌ Error in Reminder Cron Job:', error);
        }
    });

    console.log('⏰ Reminder Scheduler initialized (running every minute).');
};

module.exports = initReminderCron;
