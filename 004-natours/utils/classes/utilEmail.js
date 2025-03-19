const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

module.exports = class {
    constructor({ user, url }) {
        this.user = user;
        this.to = user.email;
        this.firstName = user.name.split(" ")[0];
        this.url = url;
        this.from = `Egormity <${process.env.EMAIL_FROM}>`;
    }

    //
    createTransport() {
        if (process.env.NODE_ENV === "production")
            return nodemailer.createTestAccount({
                service: "SendGrid",
                auth: {
                    user: process.env.NODEGRID_USERNAME,
                    password: process.env.NODEGRID_PASSWORD,
                },
            });
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                password: process.env.EMAIL_PASSWORD,
            },
        });
    }

    //
    async send({ pugTemplateName, subject }) {
        // 1. Render HTML based an the pug template
        const html = pug.renderFile(`${__dirname}/../../views/email/${pugTemplateName}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject,
        });

        // 2. Define the options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            text: htmlToText.compile()(html),
            html,
        };

        // 3. Create a transporter and send the email
        await this.createTransport().sendMail(mailOptions);
    }

    //
    async sendWelcome() {
        await this.send({ pugTemplateName: "welcome", subject: "Welcome to the Natours family!" });
    }

    //
    async sendPasswordReset() {
        await this.send({
            pugTemplateName: "passwordReset",
            subject: "Your password reset toke (valid only for 10 min)",
        });
    }
};
