const nodemailer = require("nodemailer");

module.exports = utilSendEmail = async options => {
    // 1. Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            password: process.env.EMAIL_PASSWORD,
        },
    });

    // 2. Define the options and send the email
    await transporter.sendMail({
        from: "Egormity <egormity@gmail.com>",
        to: options.email,
        subject: options.subject,
        text: options.text,
        // html:
    });
};
