const { Resend } = require("resend");

console.log(process.env.RESEND_API_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports.sendOtpEmail = async (email, otp) => {
  try {
    const response = await resend.emails.send({
      from: "onboarding@resend.dev",  
      to: email,
      subject: "OTP Verification",
      html: `
        <div style="font-family: Arial, sans-serif; text-align:center;">
          <h2>Email Verification</h2>
          <p>Your OTP code is:</p>
          <h1 style="letter-spacing:4px;">${otp}</h1>
          <p>This OTP is valid for 5 minutes.</p>
        </div>
      `
    });

    console.log("OTP email sent:", response.id);
    return true;

  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Unable to send OTP email");
  }
};