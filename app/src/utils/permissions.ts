import { LocalNotifications } from '@capacitor/local-notifications';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export interface PermissionStatus {
  microphone: boolean;
  notifications: boolean;
  location: boolean;
}

export async function checkPermissions(): Promise<PermissionStatus> {
  let mic = false;
  let notif = false;
  let loc = false;

  // Mic check
  try {
    if (navigator.permissions && navigator.permissions.query) {
      const micStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      mic = micStatus.state === 'granted';
    }
  } catch {
    mic = false;
  }

  // Notifications check
  try {
    if (Capacitor.isNativePlatform()) {
      const res = await LocalNotifications.checkPermissions();
      notif = res.display === 'granted';
    } else if ('Notification' in window) {
      notif = Notification.permission === 'granted';
    }
  } catch {
    notif = false;
  }

  // Location check
  try {
    if (Capacitor.isNativePlatform()) {
      const res = await Geolocation.checkPermissions();
      loc = res.location === 'granted';
    } else if (navigator.permissions && navigator.permissions.query) {
      const locStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      loc = locStatus.state === 'granted';
    }
  } catch {
    loc = false;
  }

  return { microphone: mic, notifications: notif, location: loc };
}

export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop tracks immediately after granting
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch (err) {
    console.warn('Microphone permission request failed:', err);
    return false;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) {
      const res = await LocalNotifications.requestPermissions();
      return res.display === 'granted';
    } else if ('Notification' in window) {
      const res = await Notification.requestPermission();
      return res === 'granted';
    }
    return false;
  } catch (err) {
    console.warn('Notification permission request failed:', err);
    return false;
  }
}

export async function requestLocationPermission(): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) {
      const res = await Geolocation.requestPermissions();
      return res.location === 'granted';
    } else if ('geolocation' in navigator) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve(true),
          () => resolve(false),
          { timeout: 5000 }
        );
      });
    }
    return false;
  } catch (err) {
    console.warn('Location permission request failed:', err);
    return false;
  }
}

