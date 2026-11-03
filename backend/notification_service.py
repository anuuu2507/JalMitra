"""
JalMitra — Notification Service Abstraction Layer
=================================================
Manages multi-channel communication for water status & supply delay alerts.
Active: In-App Bilingual Notification Center & Demo Live Modal/Toast
Planned: Government C-DAC / Telecom SMS Gateway, Automated IVRS Voice Broadcasts in Telugu
"""

import abc
from typing import Dict, Any, List

class BaseNotificationChannel(abc.ABC):
    @abc.abstractmethod
    def channel_name(self) -> str:
        pass

    @abc.abstractmethod
    def is_active(self) -> bool:
        pass

    @abc.abstractmethod
    def send_notification(self, alert_id: int, message_en: str, message_te: str, severity: str) -> Dict[str, Any]:
        pass

    @abc.abstractmethod
    def get_channel_info(self) -> Dict[str, Any]:
        pass


class InAppNotificationChannel(BaseNotificationChannel):
    """Active in prototype: delivers real-time notifications in the web client."""
    
    def channel_name(self) -> str:
        return "In-App Bilingual Notification Engine"

    def is_active(self) -> bool:
        return True

    def send_notification(self, alert_id: int, message_en: str, message_te: str, severity: str) -> Dict[str, Any]:
        return {
            "channel": "In-App",
            "delivered": True,
            "alert_id": alert_id,
            "status": "PUBLISHED_TO_APP",
            "bilingual_support": ["en", "te"],
            "timestamp": "now"
        }

    def get_channel_info(self) -> Dict[str, Any]:
        return {
            "channel_key": "in_app",
            "name": "In-App Web Dashboard",
            "status": "Active (Working)",
            "description": "Displays bilingual alerts in the user interface with real-time badges and notifications."
        }


class FutureSmsNotificationChannel(BaseNotificationChannel):
    """
    Planned Channel: Bulk SMS Integration via Indian Telecom / CDAC Mobile Seva Gateway.
    Sends template-based SMS in Telugu (Unicode) and English.
    """

    def channel_name(self) -> str:
        return "SMS Gateway (C-DAC / DLT / Telecom)"

    def is_active(self) -> bool:
        return False  # Explicitly planned, no paid API keys required

    def send_notification(self, alert_id: int, message_en: str, message_te: str, severity: str) -> Dict[str, Any]:
        return {
            "channel": "SMS Gateway",
            "delivered": False,
            "status": "SIMULATED_DISPATCH",
            "note": "Planned — not connected. Production will use DLT-approved Telugu SMS templates."
        }

    def get_channel_info(self) -> Dict[str, Any]:
        return {
            "channel_key": "sms",
            "name": "Local Language SMS",
            "status": "Planned — Not Connected",
            "description": "Designed for basic feature phones. Will dispatch 160-character Telugu unicode SMS via C-DAC Mobile Seva."
        }


class FutureVoiceCallChannel(BaseNotificationChannel):
    """
    Planned Channel: Automated Interactive Voice Response (IVRS) / Outbound Voice Broadcast.
    Critical for rural citizens with low literacy: automated phone call with pre-recorded Telugu voice.
    """

    def channel_name(self) -> str:
        return "IVRS Voice Calling Engine"

    def is_active(self) -> bool:
        return False  # Explicitly planned

    def send_notification(self, alert_id: int, message_en: str, message_te: str, severity: str) -> Dict[str, Any]:
        return {
            "channel": "Voice IVRS",
            "delivered": False,
            "status": "SIMULATED_DISPATCH",
            "note": "Planned — not connected. Production will trigger automated voice calls in Telugu."
        }

    def get_channel_info(self) -> Dict[str, Any]:
        return {
            "channel_key": "voice",
            "name": "Outbound Voice Call (IVRS)",
            "status": "Planned — Not Connected",
            "description": "Designed for accessibility and low literacy. Will play synthesized or recorded Telugu announcements."
        }


class NotificationManager:
    def __init__(self):
        self.channels: List[BaseNotificationChannel] = [
            InAppNotificationChannel(),
            FutureSmsNotificationChannel(),
            FutureVoiceCallChannel(),
        ]

    def dispatch(self, alert_id: int, message_en: str, message_te: str, severity: str) -> List[Dict[str, Any]]:
        results = []
        for channel in self.channels:
            results.append(channel.send_notification(alert_id, message_en, message_te, severity))
        return results

    def get_all_channels(self) -> List[Dict[str, Any]]:
        return [ch.get_channel_info() for ch in self.channels]


notification_manager = NotificationManager()
