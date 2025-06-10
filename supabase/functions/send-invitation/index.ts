
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  projectId: string;
  email: string;
  role: string;
  projectName: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Invitation function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { projectId, email, role, projectName }: InvitationRequest = await req.json();
    console.log("Invitation request:", { projectId, email, role, projectName });

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error("User authentication error:", userError);
      throw new Error("Authentication required");
    }

    // Check if user can manage this project
    const { data: canManage, error: permissionError } = await supabaseClient
      .rpc('user_can_manage_project', { 
        project_uuid: projectId, 
        user_uuid: user.id 
      });

    if (permissionError || !canManage) {
      console.error("Permission check failed:", permissionError);
      throw new Error("Insufficient permissions to invite users to this project");
    }

    // Create invitation record
    const { data: invitation, error: inviteError } = await supabaseClient
      .from('project_invitations')
      .insert({
        project_id: projectId,
        email: email,
        role: role,
        invited_by: user.id
      })
      .select('token')
      .single();

    if (inviteError) {
      console.error("Failed to create invitation:", inviteError);
      throw new Error("Failed to create invitation");
    }

    console.log("Invitation created:", invitation);

    // Get inviter's profile for email
    const { data: inviterProfile } = await supabaseClient
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    const inviterName = inviterProfile?.full_name || inviterProfile?.email || 'Someone';
    const invitationUrl = `${req.headers.get("origin") || "http://localhost:3000"}/invite/${invitation.token}`;

    // Send invitation email
    const emailResponse = await resend.emails.send({
      from: "Project Invitation <onboarding@resend.dev>",
      to: [email],
      subject: `You're invited to join "${projectName}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Project Invitation</h1>
          <p style="font-size: 16px; color: #666;">
            Hi there!
          </p>
          <p style="font-size: 16px; color: #666;">
            <strong>${inviterName}</strong> has invited you to join the project <strong>"${projectName}"</strong> as a <strong>${role}</strong>.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationUrl}" 
               style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Accept Invitation
            </a>
          </div>
          <p style="font-size: 14px; color: #888;">
            If the button doesn't work, you can copy and paste this link into your browser:
          </p>
          <p style="font-size: 14px; color: #888; word-break: break-all;">
            ${invitationUrl}
          </p>
          <p style="font-size: 14px; color: #888;">
            This invitation will expire in 7 days. If you don't have an account, you'll be prompted to create one.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, invitationId: invitation.token }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-invitation function:", error);
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
