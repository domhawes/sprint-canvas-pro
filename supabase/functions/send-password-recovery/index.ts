
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordRecoveryRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Password recovery function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { email }: PasswordRecoveryRequest = await req.json();
    console.log("Password recovery request for:", email);

    if (!email) {
      throw new Error("Email is required");
    }

    // Generate a password reset token using Supabase Auth Admin
    const { data, error } = await supabaseClient.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${req.headers.get("origin") || "http://localhost:3000"}/auth?type=recovery`,
      }
    });

    if (error) {
      console.error("Failed to generate recovery link:", error);
      throw new Error("Failed to generate recovery link");
    }

    console.log("Recovery link generated successfully");

    // Send password recovery email via Resend using verified domain
    const emailResponse = await resend.emails.send({
      from: "Kanbana <noreply@kanbana.co.uk>",
      to: [email],
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Password Recovery</h1>
          <p style="font-size: 16px; color: #666;">
            Hi there!
          </p>
          <p style="font-size: 16px; color: #666;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.properties?.action_link}" 
               style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 14px; color: #888;">
            If the button doesn't work, you can copy and paste this link into your browser:
          </p>
          <p style="font-size: 14px; color: #888; word-break: break-all;">
            ${data.properties?.action_link}
          </p>
          <p style="font-size: 14px; color: #888;">
            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
          <p style="font-size: 14px; color: #888;">
            If you're having trouble, please contact support.
          </p>
        </div>
      `,
    });

    console.log("Recovery email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Password recovery email sent" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-password-recovery function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
