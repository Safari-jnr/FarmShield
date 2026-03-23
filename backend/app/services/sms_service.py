from typing import List
from datetime import datetime
import json
import os

# Try to use real Africa's Talking, fallback to mock
USE_MOCK = True  # Set to False when you have live API

if not USE_MOCK:
    try:
        import africastalking
        USERNAME = "sandbox"
        API_KEY = "your_api_key_here"
        africastalking.initialize(USERNAME, API_KEY)
        sms = africastalking.SMS
        USE_MOCK = False
    except:
        USE_MOCK = True

class SMSService:
    MOCK_LOG_FILE = "mock_sms_log.txt"
    
    @staticmethod
    def send_alert(phone_numbers: List[str], message: str):
        if USE_MOCK:
            return SMSService._mock_send(phone_numbers, message)
        else:
            return SMSService._real_send(phone_numbers, message)
    
    @staticmethod
    def _mock_send(phone_numbers: List[str], message: str):
        """Mock SMS for demo"""
        formatted_numbers = []
        for number in phone_numbers:
            number = number.replace(" ", "").replace("-", "")
            if not number.startswith('+'):
                if number.startswith('0'):
                    number = '+234' + number[1:]
                else:
                    number = '+234' + number
            formatted_numbers.append(number)
        
        # Log to file
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "recipients": formatted_numbers,
            "message": message[:100] + "..." if len(message) > 100 else message,
            "status": "MOCK_SMS_SENT",
            "cost": f"₦{len(formatted_numbers) * 3}"
        }
        
        with open(SMSService.MOCK_LOG_FILE, "a") as f:
            f.write(json.dumps(log_entry) + "\n")
        
        # Print to console
        print("\n" + "="*60)
        print("📱 MOCK SMS SENT (Africa's Talking SSL error - using mock)")
        print("="*60)
        print(f"To: {', '.join(formatted_numbers)}")
        print(f"Message: {message[:80]}...")
        print(f"Mock Cost: {log_entry['cost']}")
        print("NOTE: Set USE_MOCK = False for real SMS when SSL fixed")
        print("="*60 + "\n")
        
        return {
            "success": True,
            "mock": True,
            "recipients": len(formatted_numbers),
            "note": "Mock mode - Africa's Talking sandbox SSL error"
        }
    
    @staticmethod
    def _real_send(phone_numbers: List[str], message: str):
        """Real SMS via Africa's Talking"""
        # ... real implementation when SSL works
        pass
    
    @staticmethod
    def send_threat_alert(phone_numbers: List[str], threat_type: str, location: str):
        message = f"""⚠️ FARM ALERT ⚠️

{threat_type.upper()} reported near {location}.

AVOID this area. Check FarmShield app for safe routes.

Stay safe!
- FarmShield NG"""
        return SMSService.send_alert(phone_numbers, message)
    
    @staticmethod
    def send_test_message(phone_number: str):
        message = """🌾 FarmShield Test

SMS system working!
- FarmShield Team"""
        return SMSService.send_alert([phone_number], message)
    
    @staticmethod
    def get_mock_logs():
        try:
            with open(SMSService.MOCK_LOG_FILE, "r") as f:
                return [json.loads(line) for line in f if line.strip()]
        except FileNotFoundError:
            return []