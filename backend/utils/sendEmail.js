const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    // 1. Check for missing or placeholder credentials (MOCK MODE)
    if (
        !process.env.EMAIL_USERNAME ||
        process.env.EMAIL_USERNAME === "placeholder" ||
        !process.env.EMAIL_PASSWORD ||
        process.env.EMAIL_PASSWORD === "placeholder"
    ) {
        console.log("\n====================================================");
        console.log("📧 MOCK EMAIL SENDING (Credentials not set)");
        console.log("----------------------------------------------------");
        console.log(`To: ${options.email}`);
        console.log(`Subject: ${options.subject}`);

        // Extract URL for easier copying
        const urlMatch = options.message.match(/href=(http[^ >]+)/);
        if (urlMatch) {
            console.log("\n🔗 RESET LINK (Copy this into your browser):");
            console.log(urlMatch[1]);
            console.log("");
        }

        console.log("====================================================\n");
        return; // Simulate success
    }

    // 2. Configure Transporter for Gmail (Production Mode)
    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // Use SSL
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
        debug: true, // Show debug output
        logger: true // Log information to console
    });

    try {
        // 3. Verify Connection
        await transporter.verify();
        console.log("✅ SMTP Connection Verified");

        // 4. Define email options
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Task BitSathy Support" <noreply@bitsathy.com>',
            to: options.email,
            subject: options.subject,
            html: options.message,
        };

        // 5. Send email
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent: %s", info.messageId);

    } catch (error) {
        console.error("❌ EMAIL SENDING FAILED:");
        console.error(error);

        // Provide helpful hints based on error
        if (error.code === 'EAUTH') {
            console.error("\n⚠️  HINT: Check your Gmail App Password. It is NOT your login password.");
            console.error("👉  Generate one here: https://myaccount.google.com/apppasswords\n");
        }

        throw new Error("Email could not be sent. Please try again later.");
    }
};

module.exports = sendEmail;
