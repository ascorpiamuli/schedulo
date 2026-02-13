import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6.9.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type EmailType = "confirmation" | "cancellation" | "reminder";

interface EmailPayload {
  type: EmailType;
  booking: {
    id: string;
    guest_name: string;
    guest_email: string;
    host_user_id: string; // This is the user_id from auth.users
    event_title: string;
    start_time: string;
    end_time: string;
    duration: number;
    location_type: string;
    guest_timezone: string;
  };
}

// ============================================
// BEAUTIFUL EMAIL TEMPLATES
// ============================================

function buildConfirmationEmail(booking: EmailPayload["booking"], hostName: string) {
  const start = new Date(booking.start_time);
  const end = new Date(booking.end_time);
  
  const dateStr = start.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: booking.guest_timezone,
  });
  
  const startTimeStr = start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: booking.guest_timezone,
  });
  
  const endTimeStr = end.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: booking.guest_timezone,
  });

  const locationDisplay = {
    video: "📹 Video Call",
    phone: "📞 Phone Call",
    in_person: "🏢 In Person Meeting"
  }[booking.location_type] || booking.location_type;

  const calendarLinks = {
    google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(booking.event_title)}&dates=${start.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${end.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&details=${encodeURIComponent(`Meeting with ${hostName}`)}`,
    outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(booking.event_title)}&startdt=${start.toISOString()}&enddt=${end.toISOString()}&body=${encodeURIComponent(`Meeting with ${hostName}`)}`,
    ics: `data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ASUMMARY:${encodeURIComponent(booking.event_title)}%0ADTSTART:${start.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}%0ADTEND:${end.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}%0ADESCRIPTION:Meeting with ${encodeURIComponent(hostName)}%0AEND:VEVENT%0AEND:VCALENDAR`
  };

  return {
    subject: `✅ Confirmed: ${booking.event_title} with ${hostName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f8fafc;">
        
        <!-- Main Container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 24px; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1); overflow: hidden;">
                
                <!-- Header with Gradient -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <div style="width: 80px; height: 80px; background-color: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                      <span style="font-size: 40px;">🎉</span>
                    </div>
                    <h1 style="color: white; margin: 0 0 10px; font-size: 32px; font-weight: 700;">You're booked!</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 18px;">Your meeting has been confirmed</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    
                    <!-- Greeting -->
                    <p style="font-size: 18px; margin: 0 0 20px;">Hi <strong style="color: #4f46e5;">${booking.guest_name}</strong>,</p>
                    
                    <p style="font-size: 16px; margin: 0 0 30px; color: #475569;">
                      Your <strong>${booking.event_title}</strong> with <strong>${hostName}</strong> has been successfully scheduled.
                    </p>
                    
                    <!-- Meeting Details Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 16px; padding: 25px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
                      <tr>
                        <td>
                          <h2 style="font-size: 20px; margin: 0 0 20px; color: #0f172a; display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 24px;">📅</span> Meeting Details
                          </h2>
                          
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="100" style="padding: 8px 0; color: #64748b; vertical-align: top;">Date</td>
                              <td style="padding: 8px 0; font-weight: 500; color: #0f172a;">${dateStr}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #64748b;">Time</td>
                              <td style="padding: 8px 0; font-weight: 500; color: #0f172a;">${startTimeStr} - ${endTimeStr} (${booking.guest_timezone})</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #64748b;">Duration</td>
                              <td style="padding: 8px 0; font-weight: 500; color: #0f172a;">${booking.duration} minutes</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #64748b;">Location</td>
                              <td style="padding: 8px 0; font-weight: 500; color: #0f172a;">${locationDisplay}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #64748b;">Host</td>
                              <td style="padding: 8px 0; font-weight: 500; color: #0f172a;">${hostName}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Calendar Buttons -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px;">
                      <tr>
                        <td align="center">
                          <p style="font-size: 14px; color: #64748b; margin: 0 0 15px;">Add to your calendar</p>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                            <tr>
                              <td style="padding: 0 5px;">
                                <a href="${calendarLinks.google}" style="display: inline-block; padding: 10px 20px; background-color: #4285f4; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500;">Google</a>
                              </td>
                              <td style="padding: 0 5px;">
                                <a href="${calendarLinks.outlook}" style="display: inline-block; padding: 10px 20px; background-color: #0078d4; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500;">Outlook</a>
                              </td>
                              <td style="padding: 0 5px;">
                                <a href="${calendarLinks.ics}" style="display: inline-block; padding: 10px 20px; background-color: #34a853; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500;">Apple</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #e2e8f0; margin: 30px 0;"></table>
                    
                    <!-- Important Info -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td>
                          <p style="font-size: 14px; color: #64748b; margin: 0 0 10px;">
                            <strong style="color: #0f172a;">📝 Important:</strong> Please arrive 5 minutes early
                          </p>
                          <p style="font-size: 14px; color: #64748b; margin: 0 0 10px;">
                            <strong style="color: #0f172a;">🔄 Need to reschedule?</strong> Contact ${hostName} directly
                          </p>
                          <p style="font-size: 14px; color: #64748b; margin: 0;">
                            <strong style="color: #0f172a;">📧 Booking ID:</strong> ${booking.id}
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="font-size: 14px; color: #64748b; margin: 0 0 10px;">Powered by</p>
                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 15px;">
                      <div style="width: 30px; height: 30px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 8px;"></div>
                      <span style="font-size: 18px; font-weight: 600; color: #1e293b;">Pasbest Talks</span>
                    </div>
                    <p style="font-size: 12px; color: #94a3b8; margin: 0;">© 2026 Pasbest Ventures Ltd . All rights reserved.</p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
        
      </body>
      </html>
    `,
  };
}

function buildCancellationEmail(booking: EmailPayload["booking"], hostName: string) {
  const start = new Date(booking.start_time);
  const dateStr = start.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: booking.guest_timezone,
  });
  const timeStr = start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: booking.guest_timezone,
  });

  return {
    subject: `❌ Cancelled: ${booking.event_title} with ${hostName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Cancelled</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f8fafc;">
        
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 24px; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1); overflow: hidden;">
                
                <!-- Header with Gradient -->
                <tr>
                  <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center;">
                    <div style="width: 80px; height: 80px; background-color: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                      <span style="font-size: 40px;">❌</span>
                    </div>
                    <h1 style="color: white; margin: 0 0 10px; font-size: 32px; font-weight: 700;">Booking Cancelled</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 18px;">We're sorry to see you go</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    
                    <p style="font-size: 18px; margin: 0 0 20px;">Hi <strong style="color: #4f46e5;">${booking.guest_name}</strong>,</p>
                    
                    <p style="font-size: 16px; margin: 0 0 30px; color: #475569;">
                      Your <strong>${booking.event_title}</strong> with <strong>${hostName}</strong> has been cancelled.
                    </p>
                    
                    <!-- Cancelled Meeting Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-radius: 16px; padding: 25px; margin-bottom: 30px; border: 1px solid #fecaca;">
                      <tr>
                        <td>
                          <h2 style="font-size: 20px; margin: 0 0 20px; color: #991b1b; display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 24px;">📅</span> Cancelled Meeting
                          </h2>
                          
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="100" style="padding: 8px 0; color: #64748b; vertical-align: top;">Date</td>
                              <td style="padding: 8px 0; font-weight: 500; color: #0f172a;">${dateStr}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #64748b;">Time</td>
                              <td style="padding: 8px 0; font-weight: 500; color: #0f172a;">${timeStr}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #64748b;">Duration</td>
                              <td style="padding: 8px 0; font-weight: 500; color: #0f172a;">${booking.duration} minutes</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #64748b;">Host</td>
                              <td style="padding: 8px 0; font-weight: 500; color: #0f172a;">${hostName}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Next Steps -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                      <tr>
                        <td>
                          <p style="font-size: 16px; margin: 0 0 15px; font-weight: 600; color: #0f172a;">What would you like to do?</p>
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding: 5px 0;">
                                <a href="#" style="color: #4f46e5; text-decoration: none; font-weight: 500;">→ Book another time</a>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 5px 0;">
                                <a href="#" style="color: #4f46e5; text-decoration: none; font-weight: 500;">→ Browse all events</a>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 5px 0;">
                                <a href="#" style="color: #4f46e5; text-decoration: none; font-weight: 500;">→ Contact support</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="font-size: 14px; color: #64748b; margin: 0;">
                      If this cancellation was unexpected, please reach out to ${hostName} directly to reschedule.
                    </p>
                    
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="font-size: 14px; color: #64748b; margin: 0 0 10px;">Powered by</p>
                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 15px;">
                      <div style="width: 30px; height: 30px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 8px;"></div>
                      <span style="font-size: 18px; font-weight: 600; color: #1e293b;">Pasbest Talks</span>
                    </div>
                    <p style="font-size: 12px; color: #94a3b8; margin: 0;">© 2026 Pasbest Talks. All rights reserved.</p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
        
      </body>
      </html>
    `,
  };
}

function buildReminderEmail(booking: EmailPayload["booking"], hostName: string) {
  const start = new Date(booking.start_time);
  const end = new Date(booking.end_time);
  
  const dateStr = start.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: booking.guest_timezone,
  });
  
  const startTimeStr = start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: booking.guest_timezone,
  });
  
  const endTimeStr = end.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: booking.guest_timezone,
  });

  const minutesUntil = Math.round((start.getTime() - Date.now()) / (1000 * 60));
  const hoursUntil = Math.round(minutesUntil / 60);
  const timeUntil = hoursUntil > 0 
    ? `${hoursUntil} hour${hoursUntil !== 1 ? 's' : ''}` 
    : `${minutesUntil} minute${minutesUntil !== 1 ? 's' : ''}`;

  return {
    subject: `⏰ Reminder: ${booking.event_title} with ${hostName} in ${timeUntil}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Meeting Reminder</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f8fafc;">
        
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 24px; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1); overflow: hidden;">
                
                <!-- Header with Gradient -->
                <tr>
                  <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
                    <div style="width: 80px; height: 80px; background-color: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                      <span style="font-size: 40px;">⏰</span>
                    </div>
                    <h1 style="color: white; margin: 0 0 10px; font-size: 32px; font-weight: 700;">Meeting Reminder</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 18px;">Your meeting starts in ${timeUntil}</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    
                    <p style="font-size: 18px; margin: 0 0 20px;">Hi <strong style="color: #4f46e5;">${booking.guest_name}</strong>,</p>
                    
                    <p style="font-size: 16px; margin: 0 0 30px; color: #475569;">
                      This is a reminder that your <strong>${booking.event_title}</strong> with <strong>${hostName}</strong> is coming up soon.
                    </p>
                    
                    <!-- Countdown Timer (Visual) -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px;">
                      <tr>
                        <td align="center">
                          <div style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px 40px; border-radius: 50px; color: white; font-size: 32px; font-weight: 700; letter-spacing: 2px;">
                            ${hoursUntil > 0 ? `${hoursUntil}h` : ''} ${minutesUntil % 60}m
                          </div>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Meeting Details Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; padding: 25px; margin-bottom: 30px; border: 1px solid #fcd34d;">
                      <tr>
                        <td>
                          <h2 style="font-size: 20px; margin: 0 0 20px; color: #92400e; display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 24px;">📅</span> Upcoming Meeting
                          </h2>
                          
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="100" style="padding: 8px 0; color: #64748b; vertical-align: top;">Date</td>
                              <td style="padding: 8px 0; font-weight: 500; color: #0f172a;">${dateStr}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #64748b;">Time</td>
                              <td style="padding: 8px 0; font-weight: 500; color: #0f172a;">${startTimeStr} - ${endTimeStr}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #64748b;">Duration</td>
                              <td style="padding: 8px 0; font-weight: 500; color: #0f172a;">${booking.duration} minutes</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #64748b;">Location</td>
                              <td style="padding: 8px 0; font-weight: 500; color: #0f172a;">${booking.location_type}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #64748b;">Host</td>
                              <td style="padding: 8px 0; font-weight: 500; color: #0f172a;">${hostName}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Quick Actions -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px;">
                      <tr>
                        <td align="center">
                          <p style="font-size: 14px; color: #64748b; margin: 0 0 15px;">Quick actions</p>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                            <tr>
                              <td style="padding: 0 5px;">
                                <a href="#" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500;">Join Meeting</a>
                              </td>
                              <td style="padding: 0 5px;">
                                <a href="#" style="display: inline-block; padding: 10px 20px; background-color: #64748b; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500;">Reschedule</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Preparation Tips -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border-radius: 12px; padding: 20px;">
                      <tr>
                        <td>
                          <p style="font-size: 14px; margin: 0 0 10px; font-weight: 600; color: #0f172a;">📋 Preparation Tips</p>
                          <ul style="margin: 0; padding-left: 20px; color: #64748b; font-size: 14px;">
                            <li>Test your audio and video beforehand</li>
                            <li>Find a quiet, well-lit space</li>
                            <li>Have your notes and materials ready</li>
                            <li>Join 2-3 minutes early</li>
                          </ul>
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="font-size: 14px; color: #64748b; margin: 0 0 10px;">Powered by</p>
                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 15px;">
                      <div style="width: 30px; height: 30px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 8px;"></div>
                      <span style="font-size: 18px; font-weight: 600; color: #1e293b;">Pasbest Talks</span>
                    </div>
                    <p style="font-size: 12px; color: #94a3b8; margin: 0;">© 2026 Pasbest Talks. All rights reserved.</p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
        
      </body>
      </html>
    `,
  };
}

function buildHostNotificationEmail(booking: EmailPayload["booking"], hostName: string) {
  const start = new Date(booking.start_time);
  const end = new Date(booking.end_time);
  
  const dateStr = start.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  const startTimeStr = start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  
  const endTimeStr = end.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return {
    subject: `🎉 New Booking: ${booking.event_title} with ${booking.guest_name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Booking Notification</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f8fafc;">
        
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 24px; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1); overflow: hidden;">
                
                <!-- Header with Gradient -->
                <tr>
                  <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                    <div style="width: 80px; height: 80px; background-color: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                      <span style="font-size: 40px;">🎉</span>
                    </div>
                    <h1 style="color: white; margin: 0 0 10px; font-size: 32px; font-weight: 700;">New Booking!</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 18px;">Someone just booked time with you</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    
                    <p style="font-size: 18px; margin: 0 0 20px;">Hi <strong style="color: #4f46e5;">${hostName}</strong>,</p>
                    
                    <p style="font-size: 16px; margin: 0 0 30px; color: #475569;">
                      Great news! <strong>${booking.guest_name}</strong> has booked <strong>${booking.event_title}</strong> with you.
                    </p>
                    
                    <!-- Booking Details Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 16px; padding: 25px; margin-bottom: 30px; border: 1px solid #6ee7b7;">
                      <tr>
                        <td>
                          <h2 style="font-size: 20px; margin: 0 0 20px; color: #065f46; display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 24px;">📋</span> Booking Details
                          </h2>
                          
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="120" style="padding: 8px 0; color: #64748b; vertical-align: top;">Event</td>
                              <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">${booking.event_title}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #64748b;">Guest</td>
                              <td style="padding: 8px 0; font-weight: 500; color: #0f172a;">${booking.guest_name}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #64748b;">Email</td>
                              <td style="padding: 8px 0; font-weight: 500; color: #0f172a;">
                                <a href="mailto:${booking.guest_email}" style="color: #4f46e5; text-decoration: none;">${booking.guest_email}</a>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #64748b;">Date</td>
                              <td style="padding: 8px 0; font-weight: 500; color: #0f172a;">${dateStr}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #64748b;">Time</td>
                              <td style="padding: 8px 0; font-weight: 500; color: #0f172a;">${startTimeStr} - ${endTimeStr}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #64748b;">Duration</td>
                              <td style="padding: 8px 0; font-weight: 500; color: #0f172a;">${booking.duration} minutes</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #64748b;">Location</td>
                              <td style="padding: 8px 0; font-weight: 500; color: #0f172a; text-transform: capitalize;">${booking.location_type.replace('_', ' ')}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #64748b;">Timezone</td>
                              <td style="padding: 8px 0; font-weight: 500; color: #0f172a;">${booking.guest_timezone}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Quick Actions -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px;">
                      <tr>
                        <td align="center">
                          <p style="font-size: 14px; color: #64748b; margin: 0 0 15px;">What would you like to do?</p>
                          <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                            <tr>
                              <td style="padding: 0 5px;">
                                <a href="#" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500;">View Booking</a>
                              </td>
                              <td style="padding: 0 5px;">
                                <a href="#" style="display: inline-block; padding: 12px 24px; background-color: #64748b; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500;">Contact Guest</a>
                              </td>
                              <td style="padding: 0 5px;">
                                <a href="#" style="display: inline-block; padding: 12px 24px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500;">Cancel</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Upcoming Schedule -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border-radius: 12px; padding: 20px;">
                      <tr>
                        <td>
                          <p style="font-size: 14px; margin: 0 0 10px; font-weight: 600; color: #0f172a;">📅 Your Upcoming Schedule</p>
                          <p style="font-size: 14px; color: #64748b; margin: 0;">
                            You have a meeting with ${booking.guest_name} on ${dateStr} at ${startTimeStr}.
                            Make sure you're prepared and ready to go!
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="font-size: 14px; color: #64748b; margin: 0 0 10px;">Powered by</p>
                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 15px;">
                      <div style="width: 30px; height: 30px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 8px;"></div>
                      <span style="font-size: 18px; font-weight: 600; color: #1e293b;">Pasbest Talks</span>
                    </div>
                    <p style="font-size: 12px; color: #94a3b8; margin: 0;">© 2026 Pasbest Talks. All rights reserved.</p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
        
      </body>
      </html>
    `,
  };
}
// Create reusable transporter with better error handling
const transporter = nodemailer.createTransport({
  host: "mail.pasbestventures.com",
  port: 465,
  secure: true,
  auth: {
    user: "noreply@pasbestventures.com",
    pass: "Pasbest@2025",
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

// Verify SMTP connection on startup
try {
  const verified = await transporter.verify();
  console.log('✅ SMTP Server is ready to send emails');
} catch (verifyError) {
  console.error('❌ SMTP Connection Error:', verifyError);
}

// Send email using Nodemailer
async function sendEmailViaSMTP(
  to: string,
  subject: string,
  html: string
) {
  try {
    console.log(`📧 Sending email to: ${to}`);
    
    const info = await transporter.sendMail({
      from: '"Pasbest Talks" <noreply@pasbestventures.com>',
      to: to,
      subject: subject,
      html: html,
    });

    console.log(`✅ Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Nodemailer error:", {
      message: error.message,
      code: error.code,
      command: error.command
    });
    throw error;
  }
}

// Log email to database
async function logEmailToDatabase(
  supabase: any,
  bookingId: string,
  emailType: string,
  recipientType: 'guest' | 'host',
  to: string,
  subject: string,
  status: string = 'sent',
  errorMessage?: string
) {
  try {
    const { error } = await supabase
      .from('email_logs')
      .insert({
        booking_id: bookingId,
        email_type: emailType,
        recipient_email: to,
        recipient_type: recipientType,
        subject,
        status,
        error_message: errorMessage,
        sent_at: status === 'sent' ? new Date().toISOString() : null,
      });

    if (error) {
      console.error('❌ Failed to log email:', error);
    } else {
      console.log(`✅ Email logged to database: ${to}`);
    }
  } catch (err) {
    console.error('❌ Error logging email:', err);
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204 
    });
  }

  try {
    // Only allow POST
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { 
          status: 405, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const payload: EmailPayload = await req.json();
    const { type, booking } = payload;

    if (!type || !booking) {
      return new Response(
        JSON.stringify({ error: "Missing type or booking data" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log(`\n🚀 Processing ${type} email for booking ${booking.id}`);
    console.log('=' .repeat(50));

    // Initialize Supabase client with service role key
    console.log('🔧 Initializing Supabase client...');
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log('📋 Environment check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlPrefix: supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'missing'
    });

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase environment variables');
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized');

    // Log the incoming booking data
    console.log('📦 Booking data received:', {
      bookingId: booking.id,
      hostUserId: booking.host_user_id,
      guestEmail: booking.guest_email,
      eventTitle: booking.event_title,
      type: type
    });

    // Validate host_user_id
    if (!booking.host_user_id) {
      console.error('❌ host_user_id is missing or empty');
      throw new Error('host_user_id is required');
    }

    // Clean and validate the user_id
    const cleanUserId = booking.host_user_id.trim();

    console.log('🔍 User ID details:', {
      cleaned: cleanUserId,
      cleanedLength: cleanUserId.length,
      isValidUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanUserId)
    });

    // Fetch host details using the database function
    console.log('📡 Calling database function: get_complete_user_details');
    console.log('📤 RPC parameters:', { target_user_id: cleanUserId });

    const rpcStartTime = Date.now();
    
    const { data: hostDetails, error: hostError } = await supabase
      .rpc('get_complete_user_details', { 
        target_user_id: cleanUserId
      });

    const rpcDuration = Date.now() - rpcStartTime;
    console.log(`⏱️ RPC call completed in ${rpcDuration}ms`);

    // Log the raw response
    console.log('📥 RPC Response - Raw:', {
      hasData: !!hostDetails,
      hasError: !!hostError,
      dataType: typeof hostDetails
    });

    if (hostError) {
      console.error('❌ RPC Error Object:', {
        code: hostError.code,
        message: hostError.message,
        details: hostError.details,
        hint: hostError.hint
      });
      throw new Error(`Database function error: ${hostError.message} (Code: ${hostError.code})`);
    }

    if (!hostDetails) {
      console.error('❌ No data returned from function');
      throw new Error('No host details returned from function');
    }

    console.log('📊 Host details data:', JSON.stringify(hostDetails, null, 2));

    // Check if the function returned an error object
    if (hostDetails.success === false || hostDetails.error) {
      console.error('❌ Function returned error object:', {
        error: hostDetails.error,
        message: hostDetails.message,
        success: hostDetails.success
      });
      throw new Error(`Function error: ${hostDetails.error || 'Unknown error'}`);
    }

    // Extract host information
    const hostName = hostDetails.full_name || hostDetails.name || hostDetails.username || 'Host';
    const hostEmail = hostDetails.email;

    console.log('✅ Host information extracted:', {
      hostName,
      hostEmail,
      hasName: !!hostName,
      hasEmail: !!hostEmail
    });

    if (!hostEmail) {
      console.warn('⚠️ Host email not found, host notifications will be skipped');
    }

    // Build email based on type
    let email: { subject: string; html: string };

    switch (type) {
      case "confirmation":
        email = buildConfirmationEmail(booking, hostName);
        break;
      case "cancellation":
        email = buildCancellationEmail(booking, hostName);
        break;
      case "reminder":
        email = buildReminderEmail(booking, hostName);
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Unknown email type: ${type}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
    }

    // Send email to guest
    console.log(`\n📨 Sending ${type} email to guest: ${booking.guest_email}`);
    try {
      await sendEmailViaSMTP(
        booking.guest_email,
        email.subject,
        email.html
      );
      
      await logEmailToDatabase(
        supabase,
        booking.id,
        type,
        'guest',
        booking.guest_email,
        email.subject,
        'sent'
      );
      console.log(`✅ Guest email sent successfully`);
    } catch (error) {
      await logEmailToDatabase(
        supabase,
        booking.id,
        type,
        'guest',
        booking.guest_email,
        email.subject,
        'failed',
        error.message
      );
      throw error;
    }

    // For confirmation emails, also notify the host
    if (type === "confirmation" && hostEmail) {
      console.log(`\n📨 Sending host notification to: ${hostEmail}`);
      const hostEmailContent = buildHostNotificationEmail(booking, hostName);
      try {
        await sendEmailViaSMTP(
          hostEmail,
          hostEmailContent.subject,
          hostEmailContent.html
        );
        
        await logEmailToDatabase(
          supabase,
          booking.id,
          'host-notification',
          'host',
          hostEmail,
          hostEmailContent.subject,
          'sent'
        );
        console.log(`✅ Host notification sent successfully`);
      } catch (error) {
        await logEmailToDatabase(
          supabase,
          booking.id,
          'host-notification',
          'host',
          hostEmail,
          hostEmailContent.subject,
          'failed',
          error.message
        );
        console.error('❌ Failed to send host notification:', error);
      }
    }

    console.log('=' .repeat(50));
    console.log(`✅ Successfully completed ${type} email process for booking ${booking.id}\n`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Email (${type}) sent for booking ${booking.id}`,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (err) {
    console.error("\n❌ send-booking-email error:", err);
    console.error('=' .repeat(50));
    
    return new Response(
      JSON.stringify({ 
        error: err.message || "Internal server error"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});