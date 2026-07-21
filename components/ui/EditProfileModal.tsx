import { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { Fonts, FontSizes } from '../../constants/typography';
import { Spacing, Radius, Shadows } from '../../constants/spacing';
import { Check, X } from '../../lib/icons';
import { useUserStore, StuckPattern, Goal, AccountabilityStyle } from '../../store/useUserStore';

const STUCK_OPTIONS: { value: StuckPattern; label: string }[] = [
  { value: 'restart_loop', label: 'Keep starting over' },
  { value: 'overwhelm',    label: "Mind won't quiet down" },
  { value: 'focus',        label: "Can't focus on what matters" },
  { value: 'direction',    label: 'Lost sense of direction' },
  { value: 'urgency',      label: 'Everything feels urgent' },
];
const GOAL_OPTIONS: { value: Goal; label: string }[] = [
  { value: 'morning_ownership',  label: 'Own my mornings' },
  { value: 'deep_focus',         label: 'Do deep work without guilt' },
  { value: 'calm_control',       label: 'Feel calm and in control' },
  { value: 'lasting_habit',      label: 'Build a habit that sticks' },
  { value: 'identity_alignment', label: "Reconnect with who I'm becoming" },
];
const ACCOUNTABILITY_OPTIONS: { value: AccountabilityStyle; label: string }[] = [
  { value: 'solo',      label: 'On my own — self-motivated' },
  { value: 'community', label: 'With a community around me' },
  { value: 'direct',    label: 'With direct accountability' },
  { value: 'flexible',  label: 'Depends on the season' },
];

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export default function EditProfileModal({ visible, onDismiss }: Props) {
  const { onboarding, updateOnboarding } = useUserStore();
  const [name, setName] = useState(onboarding.first_name ?? '');
  const [stuckPattern, setStuckPattern] = useState<StuckPattern | undefined>(onboarding.stuck_pattern);
  const [goal, setGoal] = useState<Goal | undefined>(onboarding.goal);
  const [accountability, setAccountability] = useState<AccountabilityStyle | undefined>(onboarding.accountability_style);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(onboarding.first_name ?? '');
      setStuckPattern(onboarding.stuck_pattern);
      setGoal(onboarding.goal);
      setAccountability(onboarding.accountability_style);
    }
  }, [visible]);

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);
    try {
      await updateOnboarding({
        first_name: name.trim() || onboarding.first_name,
        stuck_pattern: stuckPattern,
        goal,
        accountability_style: accountability,
      });
      onDismiss();
    } finally {
      setSaving(false);
    }
  };

  const renderSection = <T extends string>(
    title: string,
    options: { value: T; label: string }[],
    selected: T | undefined,
    onSelect: (v: T) => void,
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {options.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[styles.optionRow, isSelected && styles.optionRowSelected]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(opt.value);
            }}
            activeOpacity={0.75}
          >
            <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{opt.label}</Text>
            {isSelected && <Check size={16} color={Colors.tide} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <BlurView intensity={45} tint="dark" style={styles.overlay}>
        <View style={styles.overlayDark} />
        <MotiView
          from={{ translateY: 20, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 22 }}
          style={styles.sheetWrapper}
        >
          <LinearGradient colors={['#FFFFFF', '#F4F8FA']} style={styles.sheet}>
            <View style={styles.header}>
              <Text style={styles.headline}>Edit your journey profile</Text>
              <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
                <X size={18} color={Colors.inkMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your name</Text>
                <TextInput
                  style={styles.nameInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your first name"
                  placeholderTextColor={Colors.inkFaint}
                />
              </View>

              {renderSection('What was keeping me stuck', STUCK_OPTIONS, stuckPattern, setStuckPattern)}
              {renderSection('What I want', GOAL_OPTIONS, goal, setGoal)}
              {renderSection('How I work best', ACCOUNTABILITY_OPTIONS, accountability, setAccountability)}

              <View style={{ height: 12 }} />
            </ScrollView>

            <TouchableOpacity onPress={handleSave} disabled={saving} activeOpacity={0.85}>
              <LinearGradient
                colors={Colors.gradients.cta}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.saveBtn}
              >
                {saving
                  ? <ActivityIndicator color={Colors.white} size="small" />
                  : <Text style={styles.saveBtnText}>Save changes</Text>
                }
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </MotiView>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  overlayDark: { ...StyleSheet.absoluteFillObject, backgroundColor: Colors.glass.darkStrong },
  sheetWrapper: {
    borderTopLeftRadius: Radius.modal,
    borderTopRightRadius: Radius.modal,
    overflow: 'hidden',
    maxHeight: '85%',
    ...Shadows.modal,
  },
  sheet: { padding: Spacing.xl, paddingBottom: 40, gap: Spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headline: { fontSize: FontSizes.xl, fontFamily: Fonts.display, color: Colors.ink, flex: 1 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.sandDeep,
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { flexGrow: 0 },
  section: { gap: Spacing.xs, marginTop: Spacing.sm },
  sectionTitle: { fontSize: FontSizes.xs, fontFamily: Fonts.bodyMedium, color: Colors.inkMuted, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  nameInput: {
    borderWidth: 1.5, borderColor: Colors.sandBorder, borderRadius: Radius.button,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    fontSize: FontSizes.base, fontFamily: Fonts.body, color: Colors.ink,
    backgroundColor: Colors.white,
  },
  optionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.sandBorder, borderRadius: Radius.button,
    paddingHorizontal: Spacing.md, paddingVertical: 12, marginBottom: 6,
    backgroundColor: Colors.white,
  },
  optionRowSelected: { borderColor: Colors.tide, backgroundColor: Colors.tideLight },
  optionText: { fontSize: FontSizes.sm, fontFamily: Fonts.body, color: Colors.inkMuted, flex: 1 },
  optionTextSelected: { color: Colors.tide, fontFamily: Fonts.bodyMedium },
  saveBtn: {
    height: 54, borderRadius: Radius.tag,
    alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm,
  },
  saveBtnText: { fontSize: FontSizes.base, fontFamily: Fonts.bodyBold, color: Colors.white },
});
