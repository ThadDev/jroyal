import { Resend } from "resend";
import type { Reservation } from "@/types";
import { SERVICE_LABELS, formatDate, formatTime } from "@/lib/utils";

// Lazy initialize so module load doesn't throw when RESEND_API_KEY is unset
function getResend() {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not configured");
    return new Resend(key);
}
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@jroyalgrills.com";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@jroyalgrills.com";

export async function sendReservationConfirmation(reservation: Reservation) {
    const serviceLabel = SERVICE_LABELS[reservation.service] ?? reservation.service;
    const dateStr = formatDate(reservation.date);
    const timeStr = formatTime(reservation.time);

    await getResend().emails.send({
        from: FROM,
        to: reservation.email,
        subject: `Reservation Confirmed – Jroyal Grills`,
        html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>Reservation Confirmation</title></head>
      <body style="font-family: Georgia, serif; background: #0A0A0A; color: #F5F0E8; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #D4A832; font-size: 28px; margin: 0;">Jroyal Grills</h1>
            <p style="color: #8A6B1E; margin: 8px 0 0;">A Culinary Experience Like No Other</p>
          </div>
          <div style="border: 1px solid #2A2A2A; border-radius: 8px; padding: 32px; background: #1A1A1A;">
            <h2 style="color: #F0D98A; margin-top: 0;">Reservation Confirmed ✓</h2>
            <p>Dear ${reservation.name},</p>
            <p>We are delighted to confirm your reservation at Jroyal Grills. Here are your booking details:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
              <tr style="border-bottom: 1px solid #2A2A2A;">
                <td style="padding: 12px 0; color: #D4A832; font-weight: bold;">Service</td>
                <td style="padding: 12px 0;">${serviceLabel}</td>
              </tr>
              <tr style="border-bottom: 1px solid #2A2A2A;">
                <td style="padding: 12px 0; color: #D4A832; font-weight: bold;">Date</td>
                <td style="padding: 12px 0;">${dateStr}</td>
              </tr>
              <tr style="border-bottom: 1px solid #2A2A2A;">
                <td style="padding: 12px 0; color: #D4A832; font-weight: bold;">Time</td>
                <td style="padding: 12px 0;">${timeStr}</td>
              </tr>
              <tr style="border-bottom: 1px solid #2A2A2A;">
                <td style="padding: 12px 0; color: #D4A832; font-weight: bold;">Guests</td>
                <td style="padding: 12px 0;">${reservation.guests} ${reservation.guests === 1 ? "person" : "people"}</td>
              </tr>
              ${reservation.special_requests ? `
              <tr>
                <td style="padding: 12px 0; color: #D4A832; font-weight: bold;">Special Requests</td>
                <td style="padding: 12px 0;">${reservation.special_requests}</td>
              </tr>` : ""}
            </table>
            <p style="color: #8A6B1E; font-size: 14px;">📍 Opposite Flat Gate, Behind Flat, Nsukka, 410001, Enugu State, Nigeria</p>
            <p style="color: #8A6B1E; font-size: 14px;">🕐 Mon 4PM–11PM · Tue–Sun 10AM–11PM</p>
            <p style="color: #8A6B1E; font-size: 14px;">📞 +234 705 966 6459</p>
          </div>
          <p style="text-align: center; color: #555; font-size: 12px; margin-top: 32px;">
            © ${new Date().getFullYear()} Jroyal Grills. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `,
    });
}

export async function sendAdminNotification(reservation: Reservation) {
    const serviceLabel = SERVICE_LABELS[reservation.service] ?? reservation.service;
    const dateStr = formatDate(reservation.date);
    const timeStr = formatTime(reservation.time);

    await getResend().emails.send({
        from: FROM,
        to: ADMIN_EMAIL,
        subject: `New Reservation – ${reservation.name} (${serviceLabel})`,
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>New Reservation Received</h2>
        <table style="width:100%; border-collapse: collapse;">
          <tr><td style="padding:8px; font-weight:bold;">Name</td><td style="padding:8px;">${reservation.name}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Email</td><td style="padding:8px;">${reservation.email}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Phone</td><td style="padding:8px;">${reservation.phone}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Service</td><td style="padding:8px;">${serviceLabel}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Date</td><td style="padding:8px;">${dateStr}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Time</td><td style="padding:8px;">${timeStr}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Guests</td><td style="padding:8px;">${reservation.guests}</td></tr>
          ${reservation.special_requests ? `<tr><td style="padding:8px; font-weight:bold;">Notes</td><td style="padding:8px;">${reservation.special_requests}</td></tr>` : ""}
        </table>
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/reservations">View in Admin Dashboard →</a></p>
      </div>
    `,
    });
}

/** Send a welcome email to a newly registered user */
export async function sendWelcomeEmail(name: string, email: string) {
    try {
        await getResend().emails.send({
            from: FROM,
            to: email,
            subject: `Welcome to Jroyal Grills 🎉`,
            html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>Welcome</title></head>
        <body style="font-family: Georgia, serif; background: #0A0A0A; color: #F5F0E8; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #D4A832; font-size: 28px; margin: 0;">Jroyal Grills</h1>
              <p style="color: #8A6B1E; margin: 8px 0 0; letter-spacing: 0.2em; text-transform: uppercase; font-size: 11px;">Welcome to the Family</p>
            </div>
            <div style="border: 1px solid #2A2A2A; border-radius: 8px; padding: 32px; background: #1A1A1A;">
              <h2 style="color: #F0D98A; margin-top: 0;">Welcome, ${name}! 🌟</h2>
              <p style="line-height: 1.7; color: #c8c0ae;">
                We're thrilled to have you join us. Jroyal Grills is Nsukka's premier grilling and dining destination — and your account is your key to exclusive dining experiences.
              </p>
              <div style="margin: 28px 0; padding: 20px; background: rgba(212,168,50,0.06); border-left: 3px solid #D4A832;">
                <p style="margin: 0; color: #D4A832; font-size: 14px; font-weight: bold;">What you can do with your account:</p>
                <ul style="color: #c8c0ae; font-size: 14px; line-height: 2; padding-left: 20px; margin: 8px 0 0;">
                  <li>Browse our curated menu and add to your cart</li>
                  <li>Make reservations with ease</li>
                  <li>Track your orders</li>
                  <li>Manage your profile</li>
                </ul>
              </div>
              <div style="text-align: center; margin-top: 28px;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" 
                   style="display: inline-block; padding: 14px 32px; background: #D4A832; color: #0A0A0A; text-decoration: none; font-weight: bold; font-family: sans-serif; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase;">
                  Explore Your Dashboard
                </a>
              </div>
            </div>
            <p style="text-align: center; color: #555; font-size: 12px; margin-top: 32px;">
              © ${new Date().getFullYear()} Jroyal Grills. All rights reserved.<br>
              📍 Opposite Flat Gate, Behind Flat, Nsukka, Enugu State
            </p>
          </div>
        </body>
        </html>
      `,
        });
    } catch (err) {
        console.error("[Email] Failed to send welcome email:", err);
    }
}
