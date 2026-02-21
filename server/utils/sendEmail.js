require("dotenv").config();

const nodemailer = require("nodemailer");
const { google } = require("googleapis");

console.log(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REFRESH_TOKEN);

// OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

// set refresh token
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

async function sendOtpEmail(email, otp) {
  try {
    console.log("🔹 Requesting access token...");

    const accessToken = await oauth2Client.getAccessToken();

    if (!accessToken) {
      throw new Error("Failed to obtain access token");
    }

    console.log("✅ Access token received");

    // transporter using OAuth2
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.GOOGLE_EMAIL,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken, // IMPORTANT
      },
    });

    console.log("🔹 Sending email...");

    const info = await transporter.sendMail({
      from: `Intervjti <${process.env.GOOGLE_EMAIL}>`,
      to: email,
      subject: "OTP Verification",
      html: `
        <div style="font-family: Arial; text-align:center;">
          <h2>Email Verification</h2>
          <p>Your OTP code is:</p>
          <h1 style="letter-spacing:4px;">${otp}</h1>
          <p>This OTP is valid for 5 minutes.</p>
        </div>
      `,
    });

    // console.log("✅ Email sent:", info.messageId);
    return true;

  } catch (error) {
    // console.error("\n❌ EMAIL SEND FAILURE");
    // console.error("Reason →", error.response?.data || error.message || error);

    // common Gmail security block hint
    // if (String(error).includes("Invalid login")) {
    //   console.log("\n👉 Try unlocking Gmail:");
    //   console.log("https://accounts.google.com/DisplayUnlockCaptcha\n");
    // }

    // throw error;
    console.log('error occured in sendOtpEmail');
  }
}

module.exports = sendOtpEmail;