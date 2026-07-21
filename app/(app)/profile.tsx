import { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { GitBranch, Target, Users, Star, Edit, LogOut, Timer as ClockIcon, ChevronRight } from '../../lib/icons';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { useUserStore } from '../../store/useUserStore';
import { useJourneyStore } from '../../store/useJourneyStore';
import { useAudioStore } from '../../store/useAudioStore';
import { useAuthStore } from '../../store/useAuthStore';
import { CURRICULUM } from '../../constants/curriculum';
import EditProfileModal from '../../components/ui/EditProfileModal';
import {
  requestNotificationPermission,
  scheduleDaily,
  cancelDailyReminder,
  getReminderHour,
  getReminderMinute,
} from '../../lib/notifications';
import { Colors } from '../../constants/colors';
import { Fonts, FontSizes } from '../../constants/typography';
import { Spacing, Radius } from '../../constants/spacing';

const STUCK_LABELS: Record<string, string> = {
  restart_loop: 'Keep starting over',
  overwhelm:    "Mind won't quiet down",
  focus:        "Can't focus on what matters",
  direction:    'Lost sense of direction',
  urgency:      'Everything feels urgent',
};
const GOAL_LABELS: Record<string, string> = {
  morning_ownership:   'Own my mornings',
  deep_focus:          'Do deep work without guilt',
  calm_control:        'Feel calm and in control',
  lasting_habit:       'Build a habit that sticks',
  identity_alignment:  "Reconnect with who I'm becoming",
};
const ACCOUNTABILITY_LABELS: Record<string, string> = {
  solo:        'On my own — self-motivated',
  community:   'With a community around me',
  direct:      'With direct accountability',
  flexible:    'Depends on the season',
};

const PROFILE_FIELDS = [
  { key: 'stuck_pattern',       label: 'What was keeping me stuck', Icon: GitBranch, map: STUCK_LABELS },
  { key: 'goal',                label: 'What I want',               Icon: Target,    map: GOAL_LABELS },
  { key: 'accountability_style',label: 'How I work best',           Icon: Users,     map: ACCOUNTABILITY_LABELS },
] as const;

function formatTime(hour: number, minute: number): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const period = hour >= 12 ? 'PM' : 'AM';
  return `${h12}:${String(minute).padStart(2, '0')} ${period}`;
}

export default function Profile() {
  const { onboarding, flags } = useUserStore();
  const { hardStopActive, toggleHardStop, isDayComplete } = useJourneyStore();
  const { ambientEnabled, toggleAmbient } = useAudioStore();
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const completedCount = CURRICULUM.filter((d) => isDayComplete(d.day)).length;
  const daysLeft = 21 - completedCount;
  const pct = Math.round((completedCount / 21) * 100);

  const tierLabels: Record<string, string> = {
    basic: 'DIY', cohort: 'Live Cohort', vip: 'VIP Breakthrough', free: 'Free',
  };

  const [notifEnabled, setNotifEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState(8);
  const [reminderMinute, setReminderMinute] = useState(0);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  useEffect(() => {
    // Check if daily reminder is currently scheduled
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const hasReminder = scheduled.some((n) => n.identifier === 'unstuck21_daily_reminder');
      setNotifEnabled(status === 'granted' && hasReminder);
      setReminderHour(await getReminderHour());
      setReminderMinute(await getReminderMinute());
    })();
  }, []);

  const handleNotifToggle = async (val: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (val) {
      const granted = await requestNotificationPermission();
      if (granted) {
        await scheduleDaily(reminderHour, reminderMinute);
        setNotifEnabled(true);
      }
    } else {
      await cancelDailyReminder();
      setNotifEnabled(false);
    }
  };

  const applyTime = async (h: number, m: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setReminderHour(h);
    setReminderMinute(m);
    if (notifEnabled) await scheduleDaily(h, m);
  };

  // Android's dialog closes itself and reports the final value in one shot.
  // iOS's inline spinner stays open while scrolling — only track the value
  // here and commit it when the user taps Done.
  const handleTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      if (event.type === 'dismissed' || !date) return;
      applyTime(date.getHours(), date.getMinutes());
    } else if (date) {
      setReminderHour(date.getHours());
      setReminderMinute(date.getMinutes());
    }
  };

  const handleTimeDone = () => {
    setShowTimePicker(false);
    applyTime(reminderHour, reminderMinute);
  };

  const handleHardStopToggle = (val: boolean) => {
    Haptics.impactAsync(val ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium);
    toggleHardStop();
  };
  const handleAmbientToggle = () => toggleAmbient();

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Log out?',
      "You'll need to sign back in to continue your journey.",
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => logout() },
      ],
    );
  };

  const pickerDate = new Date();
  pickerDate.setHours(reminderHour, reminderMinute, 0, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* ── HERO CARD ── */}
      <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'spring', damping: 22 }}>
        <LinearGradient colors={Colors.gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
          <View style={styles.heroTop}>
            <Text style={styles.name}>{onboarding.first_name ?? 'Unstuck Member'}</Text>
            <View style={styles.tierBadge}>
              <Text style={styles.tierText}>{tierLabels[flags.tier] ?? flags.tier}</Text>
            </View>
          </View>

          {flags.vip_flag && (
            <View style={styles.vipBadge}>
              <Star size={12} color={Colors.white} strokeWidth={2} fill={Colors.white} />
              <Text style={styles.vipText}>VIP</Text>
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{completedCount}</Text>
              <Text style={styles.statLabel}>Days Done</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{daysLeft}</Text>
              <Text style={styles.statLabel}>Days Left</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{pct}%</Text>
              <Text style={styles.statLabel}>Complete</Text>
            </View>
          </View>
        </LinearGradient>
      </MotiView>

      {/* ── PLAN ── */}
      <TouchableOpacity
        style={styles.planCard}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/(auth)/paywall?voluntary=1' as any);
        }}
        activeOpacity={0.8}
      >
        <View style={styles.planInfo}>
          <Text style={styles.planLabel}>Your plan</Text>
          <Text style={styles.planValue}>{tierLabels[flags.tier] ?? flags.tier}</Text>
        </View>
        <View style={styles.planCta}>
          <Text style={styles.planCtaText}>
            {flags.tier === 'vip' ? 'View plan' : 'Upgrade'}
          </Text>
          <ChevronRight size={16} color={Colors.tide} />
        </View>
      </TouchableOpacity>

      {/* ── PAST CYCLES ── */}
      <TouchableOpacity
        style={styles.planCard}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/(app)/archive' as any);
        }}
        activeOpacity={0.8}
      >
        <View style={styles.planInfo}>
          <Text style={styles.planLabel}>Journey history</Text>
          <Text style={styles.planValue}>Past cycles</Text>
        </View>
        <View style={styles.planCta}>
          <ChevronRight size={16} color={Colors.tide} />
        </View>
      </TouchableOpacity>

      {/* ── SETTINGS ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Settings</Text>

        <View style={[styles.settingRow, hardStopActive && styles.settingRowActive]}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Hard Stop Mode</Text>
            <Text style={styles.settingDesc}>Disable focus tools. Rest is your task.</Text>
          </View>
          <Switch
            value={hardStopActive}
            onValueChange={handleHardStopToggle}
            trackColor={{ true: Colors.tide, false: Colors.sandBorder }}
            thumbColor={Colors.white}
          />
        </View>

        <View style={styles.rowDivider} />

        <View style={[styles.settingRow, ambientEnabled && styles.settingRowAmbient]}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Ambient Audio</Text>
            <Text style={styles.settingDesc}>Background music while you work.</Text>
          </View>
          <Switch
            value={ambientEnabled}
            onValueChange={handleAmbientToggle}
            trackColor={{ true: Colors.tide, false: Colors.sandBorder }}
            thumbColor={Colors.white}
          />
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Daily Reminder</Text>
            <Text style={styles.settingDesc}>Nudge to keep your streak alive.</Text>
          </View>
          <Switch
            value={notifEnabled}
            onValueChange={handleNotifToggle}
            trackColor={{ true: Colors.tide, false: Colors.sandBorder }}
            thumbColor={Colors.white}
          />
        </View>

        {notifEnabled && (
          <TouchableOpacity
            style={styles.timeRow}
            onPress={() => setShowTimePicker(true)}
            activeOpacity={0.75}
          >
            <ClockIcon size={14} color={Colors.tide} strokeWidth={2} />
            <Text style={styles.timeRowText}>{formatTime(reminderHour, reminderMinute)}</Text>
            <Text style={styles.timeRowChange}>Change</Text>
          </TouchableOpacity>
        )}

        {showTimePicker && (
          <View>
            <DateTimePicker
              value={pickerDate}
              mode="time"
              is24Hour={false}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity style={styles.timeDoneBtn} onPress={handleTimeDone} activeOpacity={0.8}>
                <Text style={styles.timeDoneBtnText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* ── JOURNEY PROFILE ── */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Your journey profile</Text>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setEditModalVisible(true); }}
            activeOpacity={0.75}
          >
            <Edit size={13} color={Colors.tide} strokeWidth={2} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {PROFILE_FIELDS.map((field, i) => {
          const raw = onboarding[field.key as keyof typeof onboarding] as string | undefined;
          if (!raw) return null;
          const display = (field.map as Record<string, string>)[raw] ?? raw.replace(/_/g, ' ');
          return (
            <View key={field.key}>
              {i > 0 && <View style={styles.rowDivider} />}
              <View style={styles.profileRow}>
                <View style={styles.profileIcon}>
                  <field.Icon size={14} color={Colors.tide} strokeWidth={2} />
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileKey}>{field.label}</Text>
                  <Text style={styles.profileVal}>{display}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* ── ACCOUNT ── */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.75}>
        <LogOut size={16} color={Colors.error} strokeWidth={2} />
        <Text style={styles.logoutBtnText}>Log Out</Text>
      </TouchableOpacity>

      <View style={{ height: 80 }} />

      <EditProfileModal visible={editModalVisible} onDismiss={() => setEditModalVisible(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.sand },
  content: { paddingHorizontal: Spacing.lg, paddingTop: 64, gap: Spacing.md },

  // Hero
  heroCard: {
    backgroundColor: Colors.tide,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontSize: FontSizes['3xl'], fontFamily: Fonts.display, color: Colors.white, flex: 1 },
  tierBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.tag, paddingHorizontal: 10, paddingVertical: 4,
  },
  tierText: { fontSize: FontSizes.xs, fontFamily: Fonts.bodyMedium, color: Colors.white },
  vipBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.gold, borderRadius: Radius.tag,
    paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start',
  },
  vipText: { color: Colors.white, fontFamily: Fonts.bodyBold, fontSize: FontSizes.xs },
  statsRow: { flexDirection: 'row', alignItems: 'center', paddingTop: Spacing.sm },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statNum: { fontSize: FontSizes['2xl'], fontFamily: Fonts.display, color: Colors.white },
  statLabel: { fontSize: FontSizes.xs, fontFamily: Fonts.bodyMedium, color: 'rgba(255,255,255,0.6)' },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' },

  // Plan
  planCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.sandBorder,
  },
  planInfo: { gap: 2 },
  planLabel: { fontSize: FontSizes.xs, fontFamily: Fonts.body, color: Colors.inkMuted },
  planValue: { fontSize: FontSizes.base, fontFamily: Fonts.bodyMedium, color: Colors.ink },
  planCta: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  planCtaText: { fontSize: FontSizes.sm, fontFamily: Fonts.bodyMedium, color: Colors.tide },

  // Cards
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.sandBorder,
    gap: Spacing.sm,
  },
  cardTitle: {
    fontSize: FontSizes.lg, fontFamily: Fonts.display, fontStyle: 'italic', color: Colors.ink,
    marginBottom: 4,
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: Radius.tag,
    backgroundColor: Colors.tideLight,
    marginBottom: 4,
  },
  editBtnText: { fontSize: FontSizes.xs, fontFamily: Fonts.bodyMedium, color: Colors.tide },

  // Settings rows
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.button,
  },
  settingRowActive:  { backgroundColor: Colors.tideLight, paddingHorizontal: Spacing.sm, marginHorizontal: -Spacing.sm },
  settingRowAmbient: { backgroundColor: Colors.sandDeep,  paddingHorizontal: Spacing.sm, marginHorizontal: -Spacing.sm },
  settingInfo: { flex: 1, gap: 2 },
  settingLabel: { fontSize: FontSizes.base, fontFamily: Fonts.bodyMedium, color: Colors.ink },
  settingDesc:  { fontSize: FontSizes.xs, fontFamily: Fonts.body, color: Colors.inkMuted },
  rowDivider: { height: 1, backgroundColor: Colors.sandBorder, marginVertical: 2 },

  // Time row
  timeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.sm,
    marginHorizontal: -Spacing.sm,
    backgroundColor: Colors.sandDeep, borderRadius: Radius.button,
  },
  timeRowText: { flex: 1, fontSize: FontSizes.sm, fontFamily: Fonts.bodyMedium, color: Colors.ink },
  timeRowChange: { fontSize: FontSizes.xs, fontFamily: Fonts.bodyMedium, color: Colors.tide },
  timeDoneBtn: {
    alignSelf: 'center', marginTop: 4, marginBottom: 8,
    paddingHorizontal: Spacing.lg, paddingVertical: 8,
    borderRadius: Radius.tag, backgroundColor: Colors.tide,
  },
  timeDoneBtnText: { fontSize: FontSizes.sm, fontFamily: Fonts.bodyBold, color: Colors.white },

  // Profile rows
  profileRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, paddingVertical: Spacing.sm },
  profileIcon: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.tideLight,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
  },
  profileInfo: { flex: 1, gap: 2 },
  profileKey: { fontSize: FontSizes.xs, fontFamily: Fonts.body, color: Colors.inkMuted },
  profileVal: { fontSize: FontSizes.base, fontFamily: Fonts.bodyMedium, color: Colors.ink },

  // Logout
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: Spacing.md,
    borderRadius: Radius.button,
    borderWidth: 1.5, borderColor: Colors.error + '40',
    backgroundColor: Colors.white,
  },
  logoutBtnText: { fontSize: FontSizes.base, fontFamily: Fonts.bodyMedium, color: Colors.error },
});
