"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSurveyPublishedEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: 'ufar786@gmail.com',
        pass: 'dwem wprr kdro jkyr'
    }
});
const sendSurveyPublishedEmail = async (surveyTitle) => {
    try {
        const mailOptions = {
            from: 'Advance Telecom Admin <ufar786@gmail.com>',
            to: 'ufar786@gmail.com', // Sending to admin
            subject: `New Survey Published: ${surveyTitle}`,
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: white; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #4F46E5;">New Survey Published!</h2>
            <p style="color: #333; font-size: 16px;">A new survey titled <strong>"${surveyTitle}"</strong> has just been published to all TSO devices.</p>
            <p style="color: #666; font-size: 14px;">The devices will automatically sync this new schema on their next login or active network connection.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px;">This is an automated message from the Advance Telecom Survey Management System.</p>
          </div>
        </div>
      `
        };
        await transporter.sendMail(mailOptions);
        console.log('Email notification sent successfully.');
    }
    catch (error) {
        console.error('Error sending email notification:', error);
    }
};
exports.sendSurveyPublishedEmail = sendSurveyPublishedEmail;
//# sourceMappingURL=email.js.map