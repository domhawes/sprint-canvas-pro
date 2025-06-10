
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

    // Get the origin from the request headers, fallback to production URL
    const origin = req.headers.get("origin") || "https://kanbana.co.uk";
    console.log("Using origin:", origin);

    // Generate a password reset token using Supabase Auth Admin with 1 hour expiry
    const { data, error } = await supabaseClient.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${origin}/auth?type=recovery`,
      }
    });

    if (error) {
      console.error("Failed to generate recovery link:", error);
      throw new Error(`Failed to generate recovery link: ${error.message}`);
    }

    if (!data.properties?.action_link) {
      throw new Error("No action link generated");
    }

    console.log("Recovery link generated successfully");

    // Send password recovery email via Resend using verified domain
    const emailResponse = await resend.emails.send({
      from: "Kanbana <noreply@kanbana.co.uk>",
      to: [email],
      subject: "Reset Your Kanbana Password",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="color: #333; margin-bottom: 20px;">Reset Your Password</h1>
          <p style="font-size: 16px; margin-bottom: 20px;">
            We received a request to reset your Kanbana password. Click the button below to set a new password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.properties.action_link}" 
               style="background-color: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            This link will expire in 1 hour. If you didn't request this, please ignore this email.
          </p>
          <p style="font-size: 12px; color: #999; margin-top: 30px;">
            If the button doesn't work, copy this link: ${data.properties.action_link}
          </p>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error("Email sending failed:", emailResponse.error);
      throw new Error(`Email sending failed: ${emailResponse.error.message}`);
    }

    console.log("Recovery email sent successfully:", emailResponse.data?.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Password recovery email sent successfully",
        email_id: emailResponse.data?.id
      }),
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
      JSON.stringify({ 
        error: error.message,
        details: "Check the function logs for more information"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
