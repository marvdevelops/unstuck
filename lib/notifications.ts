/**
 * Unstuck 21 — Local Push Notifications
 *
 * Handles:
 *  - Permission request on first launch
 *  - Daily reminder scheduled at user's preferred hour
 *  - Day-completion celebration notification
 *  - Hard-stop reminder
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIF_PERMISSION_KEY = 'notif_permission_asked';
const REMINDER_HOUR_KEY    = 'notif_reminder_hour';
const REMINDER_MINUTE_KEY  = 'notif_reminder_minute';
const DEFAULT_REMINDER_HOUR   = 8; // 8:00 AM
const DEFAULT_REMINDER_MINUTE = 0;

// How the notification looks while app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// ── Permissions ────────────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) {
    // Simulators can't receive notifications
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Unstuck 21',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2E6E80',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  await AsyncStorage.setItem(NOTIF_PERMISSION_KEY, 'asked');
  return status === 'granted';
}

export async function hasAskedPermission(): Promise<boolean> {
  const asked = await AsyncStorage.getItem(NOTIF_PERMISSION_KEY);
  return asked === 'asked';
}

// ── Daily reminder ─────────────────────────────────────────────────────────

const DAILY_REMINDER_ID = 'unstuck21_daily_reminder';

const REMINDER_MESSAGES = [
  { title: "Your 21 days won't complete themselves.", body: "10 minutes of focus changes everything." },
  { title: "Day {day} is waiting for you.", body: "Show up today. That's the whole practice." },
  { title: "Small action, compound results.", body: "Open Unstuck 21 and take one step." },
  { title: "The science is on your side.", body: "Neuroplasticity works — but only if you show up." },
  { title: "You made it this far.", body: "Don't break the streak. Open today's session." },
];

export async function scheduleDaily(
  hour: number = DEFAULT_REMINDER_HOUR,
  minute: number = DEFAULT_REMINDER_MINUTE,
  dayNum = 1,
): Promise<void> {
  // Cancel existing daily reminder
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID).catch(() => {});

  const msg = REMINDER_MESSAGES[dayNum % REMINDER_MESSAGES.length];

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      title: msg.title.replace('{day}', String(dayNum)),
      body: msg.body,
      sound: false,
      data: { screen: 'journey' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  await AsyncStorage.setItem(REMINDER_HOUR_KEY, String(hour));
  await AsyncStorage.setItem(REMINDER_MINUTE_KEY, String(minute));
}

export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID).catch(() => {});
}

export async function getReminderHour(): Promise<number> {
  const stored = await AsyncStorage.getItem(REMINDER_HOUR_KEY);
  return stored ? parseInt(stored, 10) : DEFAULT_REMINDER_HOUR;
}

export async function getReminderMinute(): Promise<number> {
  const stored = await AsyncStorage.getItem(REMINDER_MINUTE_KEY);
  return stored ? parseInt(stored, 10) : DEFAULT_REMINDER_MINUTE;
}

// ── Day-completion celebration ──────────────────────────────────────────────

const COMPLETION_TITLES = [
  "Day {day} done.",
  "You showed up. Again.",
  "Streak alive. Day {day} complete.",
  "Compound effect in motion. Day {day}.",
];

const COMPLETION_BODIES = [
  "The brain that just worked is different from the one that woke up this morning.",
  "Each session builds the neural pathway. Keep going.",
  "One more day closer to automatic. Rest well.",
  "You're proving something to yourself. That matters.",
];

export async function sendCompletionNotification(dayNum: number): Promise<void> {
  const title = COMPLETION_TITLES[dayNum % COMPLETION_TITLES.length].replace('{day}', String(dayNum));
  const body  = COMPLETION_BODIES[dayNum % COMPLETION_BODIES.length];

  // Fire 3 hours after completion as a reinforcement nudge
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: false,
      data: { screen: 'journey', dayNum },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3 * 60 * 60,
      repeats: false,
    },
  });
}

// ── Notification response listener ─────────────────────────────────────────

type NavFn = (screen: string, params?: Record<string, unknown>) => void;

let listenerSub: Notifications.EventSubscription | null = null;

export function setupNotificationResponseListener(navigate: NavFn): () => void {
  listenerSub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as any;
    if (data?.screen === 'journey') {
      navigate('journey');
    }
  });
  return () => listenerSub?.remove();
}
