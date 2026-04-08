import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

# ── Config (set these in your .env) ──────────────────────────────────────────
SMTP_HOST     = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT     = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER     = os.getenv("SMTP_USER", "")       # your Gmail address
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")   # Gmail App Password
FROM_NAME     = os.getenv("FROM_NAME", "FarmShield Alerts")

THREAT_EMOJI = {
    "bandits":      "⚠️",
    "flood":        "🌊",
    "pests":        "🐛",
    "sick_crops":   "🌾",
    "dead_animals": "💀",
    "other":        "⚠️",
}

def _build_html(threat_type: str, description: str, location: str, reporter: str) -> str:
    emoji = THREAT_EMOJI.get(threat_type, "⚠️")
    label = threat_type.replace("_", " ").title()
    return f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f0fdf4;border-radius:12px;overflow:hidden">
      <div style="background:#14532d;padding:24px 28px">
        <div style="color:#4ade80;font-size:13px;margin-bottom:4px">FarmShield Safety Alert</div>
        <div style="color:white;font-size:22px;font-weight:700">{emoji} {label} Reported Nearby</div>
      </div>
      <div style="padding:24px 28px;background:white">
        <p style="color:#374151;font-size:15px;margin-bottom:16px">
          A threat has been reported near your farm location. Please take precautions.
        </p>
        <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:14px 16px;border-radius:6px;margin-bottom:20px">
          <div style="font-weight:700;color:#991b1b;margin-bottom:4px">{emoji} {label}</div>
          <div style="color:#374151;font-size:14px">{description or "No additional details provided."}</div>
        </div>
        <table style="width:100%;font-size:13px;color:#6b7280;border-collapse:collapse">
          <tr><td style="padding:6px 0;border-bottom:1px solid #f3f4f6"><strong>Location</strong></td><td style="padding:6px 0;border-bottom:1px solid #f3f4f6">{location}</td></tr>
          <tr><td style="padding:6px 0;border-bottom:1px solid #f3f4f6"><strong>Reported by</strong></td><td style="padding:6px 0;border-bottom:1px solid #f3f4f6">{reporter}</td></tr>
          <tr><td style="padding:6px 0"><strong>Time</strong></td><td style="padding:6px 0">{datetime.utcnow().strftime("%d %b %Y, %H:%M UTC")}</td></tr>
        </table>
        <div style="margin-top:24px;padding:14px;background:#f0fdf4;border-radius:8px;font-size:13px;color:#166534">
          💡 Stay safe — avoid the area if possible and check the FarmShield app for live updates.
        </div>
      </div>
      <div style="padding:16px 28px;background:#f8fafc;font-size:12px;color:#9ca3af;text-align:center">
        FarmShield · Protecting Nigerian Farmers · You received this because you registered with this email.
      </div>
    </div>
    """

def send_alert_email(to_email: str, threat_type: str, description: str,
                     location: str = "Near your farm", reporter: str = "Community member") -> bool:
    """Send a threat alert email. Returns True on success."""
    if not SMTP_USER or not SMTP_PASSWORD:
        # SMTP not configured — log and skip silently
        print(f"[EMAIL] SMTP not configured. Would have sent to {to_email}: {threat_type}")
        return False

    try:
        label = threat_type.replace("_", " ").title()
        emoji = THREAT_EMOJI.get(threat_type, "⚠️")

        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"{emoji} FarmShield Alert: {label} reported near you"
        msg["From"]    = f"{FROM_NAME} <{SMTP_USER}>"
        msg["To"]      = to_email

        # Plain text fallback
        plain = f"FarmShield Alert\n\n{emoji} {label} reported near your farm.\n\n{description or 'No details.'}\n\nLocation: {location}\nTime: {datetime.utcnow().strftime('%d %b %Y %H:%M UTC')}\n\nStay safe."
        msg.attach(MIMEText(plain, "plain"))
        msg.attach(MIMEText(_build_html(threat_type, description, location, reporter), "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, to_email, msg.as_string())

        print(f"[EMAIL] Sent alert to {to_email}")
        return True

    except Exception as e:
        print(f"[EMAIL] Failed to send to {to_email}: {e}")
        return False
