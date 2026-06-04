import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useUserStore } from '../../store/useUserStore';
import { useJourneyStore } from '../../store/useJourneyStore';
import { useAudioStore } from '../../store/useAudioStore';
import { CURRICULUM } from '../../constants/curriculum';
import { Colors } from '../../constants/colors';
import { FontSizes } from '../../constants/typography';
import { Spacing, Radius, Shadows } from '../../constants/spacing';
import Card from '../../components/ui/Card';

export default function Profile() {
  const { onboarding, flags } = useUserStore();
  const { hardStopActive, toggleHardStop, isDayComplete } = useJourneyStore();
  const { ambientEnabled, toggleAmbient } = useAudioStore();

  const completedCount = CURRICULUM.filter((d) => isDayComplete(d.day)).length;
  const tierLabels: Record<string, string> = { basic: 'DIY (₱1,499)', cohort: 'Live Cohort (₱7,499)', vip: 'VIP Breakthrough (₱13,999)' };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Profile</Text>

      <Card style={styles.heroCard}>
        <Text style={styles.name}>{onboarding.first_name ?? 'Unstuck Member'}</Text>
        <Text style={styles.tier}>{tierLabels[flags.tier] ?? flags.tier}</Text>
        {flags.vip_flag && <View style={styles.vipBadge}><Text style={styles.vipText}>⭐ VIP</Text></View>}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{completedCount}</Text>
            <Text style={styles.statLabel}>Days Complete</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{21 - completedCount}</Text>
            <Text style={styles.statLabel}>Days Left</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{Math.round((completedCount / 21) * 100)}%</Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.settingsCard}>
        <Text style={styles.settingsTitle}>Settings</Text>

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Hard Stop Mode</Text>
            <Text style={styles.settingDesc}>Disable focus tools. Rest is your task.</Text>
          </View>
          <Switch
            value={hardStopActive}
            onValueChange={toggleHardStop}
            trackColor={{ true: Colors.primaryBlue, false: Colors.lightBlue }}
            thumbColor={Colors.white}
          />
        </View>

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Ambient Audio</Text>
            <Text style={styles.settingDesc}>Background music while you work.</Text>
          </View>
          <Switch
            value={ambientEnabled}
            onValueChange={toggleAmbient}
            trackColor={{ true: Colors.primaryBlue, false: Colors.lightBlue }}
            thumbColor={Colors.white}
          />
        </View>
      </Card>

      <Card style={styles.onboardingCard}>
        <Text style={styles.settingsTitle}>Your Journey Profile</Text>
        {onboarding.stuck_pattern && (
          <View style={styles.profileRow}>
            <Text style={styles.profileKey}>Stuck Pattern</Text>
            <Text style={styles.profileVal}>{onboarding.stuck_pattern.replace('_', ' ')}</Text>
          </View>
        )}
        {onboarding.goal && (
          <View style={styles.profileRow}>
            <Text style={styles.profileKey}>Goal</Text>
            <Text style={styles.profileVal}>{onboarding.goal.replace('_', ' ')}</Text>
          </View>
        )}
        {onboarding.accountability_style && (
          <View style={styles.profileRow}>
            <Text style={styles.profileKey}>Accountability</Text>
            <Text style={styles.profileVal}>{onboarding.accountability_style}</Text>
          </View>
        )}
      </Card>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightBlue },
  content: { paddingHorizontal: Spacing.lg, paddingTop: 60, gap: Spacing.md },
  pageTitle: { fontSize: FontSizes['2xl'], fontWeight: '700', color: Colors.darkNavy },
  heroCard: { gap: Spacing.sm },
  name: { fontSize: FontSizes['2xl'], fontWeight: '700', color: Colors.darkNavy },
  tier: { fontSize: FontSizes.sm, color: Colors.mutedTeal },
  vipBadge: {
    backgroundColor: Colors.amber,
    borderRadius: Radius.tag,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  vipText: { color: Colors.white, fontWeight: '700', fontSize: FontSizes.sm },
  statsRow: { flexDirection: 'row', gap: Spacing.lg, marginTop: Spacing.sm },
  stat: { alignItems: 'center' },
  statNum: { fontSize: FontSizes['2xl'], fontWeight: '700', color: Colors.primaryBlue },
  statLabel: { fontSize: FontSizes.xs, color: Colors.mutedTeal },
  settingsCard: { gap: Spacing.md },
  settingsTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.darkNavy },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.md },
  settingLabel: { fontSize: FontSizes.base, fontWeight: '600', color: Colors.darkNavy },
  settingDesc: { fontSize: FontSizes.xs, color: Colors.mutedTeal, marginTop: 2 },
  onboardingCard: { gap: Spacing.sm },
  profileRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.lightBlue },
  profileKey: { fontSize: FontSizes.sm, color: Colors.mutedTeal },
  profileVal: { fontSize: FontSizes.sm, color: Colors.darkNavy, fontWeight: '600', textTransform: 'capitalize' },
});
