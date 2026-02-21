// require("dotenv").config();

// const nodemailer = require("nodemailer");
// const { google } = require("googleapis");

// console.log(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REFRESH_TOKEN);

// // OAuth2 client
// const oauth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   "https://developers.google.com/oauthplayground"
// );

// // set refresh token
// oauth2Client.setCredentials({
//   refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
// });

// async function sendOtpEmail(email, otp) {
//   try {
//     console.log("🔹 Requesting access token...");

//     const accessToken = await oauth2Client.getAccessToken();

//     if (!accessToken) {
//       throw new Error("Failed to obtain access token");
//     }

//     console.log("✅ Access token received");

//     // transporter using OAuth2
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         type: "OAuth2",
//         user: process.env.GOOGLE_EMAIL,
//         clientId: process.env.GOOGLE_CLIENT_ID,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//         refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
//         accessToken: accessToken, // IMPORTANT
//       },
//     });

//     console.log("🔹 Sending email...");

//     const info = await transporter.sendMail({
//       from: `Intervjti <${process.env.GOOGLE_EMAIL}>`,
//       to: email,
//       subject: "OTP Verification",
//       html: `
//         <div style="font-family: Arial; text-align:center;">
//           <h2>Email Verification</h2>
//           <p>Your OTP code is:</p>
//           <h1 style="letter-spacing:4px;">${otp}</h1>
//           <p>This OTP is valid for 5 minutes.</p>
//         </div>
//       `,
//     });

//     console.log("✅ Email sent:", info.messageId);
//     return true;

//   } catch (error) {
//     console.error("\n❌ EMAIL SEND FAILURE");
//     // console.error("Reason →", error.response?.data || error.message || error);

//     // common Gmail security block hint
//     // if (String(error).includes("Invalid login")) {
//     //   console.log("\n👉 Try unlocking Gmail:");
//     //   console.log("https://accounts.google.com/DisplayUnlockCaptcha\n");
//     // }

//     throw error;
//     console.log('error occured in sendOtpEmail');
//   }
// }

// module.exports = sendOtpEmail;


require("dotenv").config();
const { google } = require("googleapis");

// OAuth2 setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

// attach refresh token
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

/**
 * 🔹 Send email using Gmail REST API
 */
async function sendEmail(email, subject, htmlContent) {
  try {
    console.log("🔹 Generating access token...");
    const accessToken = await oauth2Client.getAccessToken();

    if (!accessToken?.token) {
      throw new Error("Failed to obtain access token");
    }

    console.log("✅ Access token ready");

    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client,
    });

    // encode subject (UTF-8 safe)
    const encodedSubject = `=?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`;

    // build RFC 2822 email
    const messageParts = [
      `From: JoinMe Support <${process.env.GOOGLE_EMAIL}>`,
      `To: ${email}`,
      "Content-Type: text/html; charset=utf-8",
      "MIME-Version: 1.0",
      `Subject: ${encodedSubject}`,
      "",
      htmlContent,
    ];

    const message = messageParts.join("\n");

    // base64url encode
    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    console.log("🔹 Sending email...");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log("✅ Email sent successfully");
    return true;

  } catch (error) {
    console.error("❌ Gmail API Error:", error.message);
    return false;
  }
}

/**
 * 🔹 OTP Email Sender
 */
async function sendOtpEmail(email, otp) {
  const subject = "Your OTP Verification Code";

  const html = `
    <div style="font-family: Arial; text-align:center;">
      <h2>Verify Your Email</h2>
      <p>Your OTP code is:</p>
      <h1 style="letter-spacing:4px;">${otp}</h1>
      <p>This OTP is valid for 5 minutes.</p>
      <p>Please do not share this code.</p>
      <br/>
      <p>— JoinMe Team</p>
    </div>
  `;

  return await sendEmail(email, subject, html);
}

module.exports = sendOtpEmail;