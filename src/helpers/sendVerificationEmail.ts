import { resend } from "@/lib/resend";
import { ApiResponse } from "@/types/apiResponse";
import VerificationEmail from "../../emails/VerificationEmail";

export async function sendVerificationEmail(email: string, username: string, verifyCode: string): Promise<ApiResponse>{
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Anonymous Message Verification code',
      react: VerificationEmail({username: username, otp: verifyCode}),
    });
    return {
      success: true, 
      message: "Verification email sent successfully"
    }
  } catch (emailError) {
    console.error("Error in sending verification email", emailError);
    return {
      success: false, 
      message: "Failed to send verification email"
    }
  }
}