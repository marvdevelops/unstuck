import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { useToolStore } from '../../../store/useToolStore';
import { Colors } from '../../../constants/colors';
import { FontSizes } from '../../../constants/typography';
import { Spacing, Radius, Shadows } from '../../../constants/spacing';

type Track = 'home' | 'negative' | 'positive';
type Step = 'home' | 'mood' | 'text' | 'control' | 'reframe' | 'celebration';

const NEGATIVE_MOODS = ['Anxiety', 'Fear', 'Anger', 'Overwhelm', 'Impulsivity'];
const POSITIVE_MOODS = ['Joy', 'Gratitude', 'Pride', 'Hope'];

const REFRAMES: Record<string, string> = {
  Anxiety: "Anxiety is just your brain trying to protect you from the unknown. Ground yourself in what is known right now.",
  Fear: "This isn't hard; it's just unfamiliar. And you can navigate the unfamiliar.",
  Anger: "You have agency over your response. Breathe into the tension and reclaim your control.",
  Overwhelm: "Focus your air on one balloon. What's the one thing you can do right now?",
  Impulsivity: "Impulsivity is a false sense of urgency. Take a breath, break the loop, and take your power back.",
};

export default function ReleaseScreen() {
  const router = useRouter();
  const { addVictory } = useToolStore();
  const [track, setTrack] = useState<Track>('home');
  const [step, setStep] = useState<Step>('home');
  const [mood, setMood] = useState('');
  const [text, setText] = useState('');
  const [burning, setBurning] = useState(false);

  const handleNegativeTrack = () => { setTrack('negative'); setStep('mood'); };
  const handlePositiveTrack = () => { setTrack('positive'); setStep('mood'); };

  const handleMoodSelect = (m: string) => {
    setMood(m);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep('text');
  };

  const handleRelease = () => {
    if (!text.trim()) return;
    setStep('control');
  };

  const handleLockIn = async () => {
    if (!text.trim()) return;
    await addVictory({ mood, text, date: new Date().toISOString() });
    setStep('celebration');
  };

  const handleControl = (canControl: boolean) => {
    if (canControl) {
      setStep('reframe');
    } else {
      setBurning(true);
      setTimeout(() => {
        setBurning(false);
        setStep('reframe');
      }, 2800);
    }
  };

  const reset = () => { setTrack('home'); setStep('home'); setMood(''); setText(''); setBurning(false); };

  // ── HOME ─────────────────────────────────────────────────────────────────
  if (step === 'home') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.centered}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>The Release Corner</Text>
        <Text style={styles.subtitle}>Your brain is a processor, not a storage drive.{'\n'}Let's process what's on your mind right now.</Text>
        <View style={styles.trackGrid}>
          <TouchableOpacity style={styles.trackCard} onPress={handleNegativeTrack}>
            <Text style={styles.trackIcon}>⛅</Text>
            <Text style={styles.trackTitle}>Something's weighing on me</Text>
            <Text style={styles.trackSub}>Process anxiety, fear, anger, or overwhelm.</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.trackCard, styles.trackCardAmber]} onPress={handlePositiveTrack}>
            <Text style={styles.trackIcon}>⭐</Text>
            <Text style={styles.trackTitle}>Something good happened</Text>
            <Text style={styles.trackSub}>Anchor a win, joy, pride, or hope.</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // ── MOOD SELECTION ────────────────────────────────────────────────────────
  if (step === 'mood') {
    const moods = track === 'negative' ? NEGATIVE_MOODS : POSITIVE_MOODS;
    const isAmber = track === 'positive';
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={reset} style={styles.backBtn}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.stepTitle}>{track === 'negative' ? 'How are you feeling right now?' : "What's the energy today?"}</Text>
        <View style={styles.moodPills}>
          {moods.map((m) => (
            <TouchableOpacity key={m} style={[styles.moodPill, isAmber && styles.moodPillAmber, mood === m && styles.moodPillSelected]} onPress={() => handleMoodSelect(m)}>
              <Text style={[styles.moodPillText, mood === m && styles.moodPillTextSelected]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  // ── TEXT ENTRY ────────────────────────────────────────────────────────────
  if (step === 'text') {
    const isPositive = track === 'positive';
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setStep('mood')} style={styles.backBtn}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.stepTitle}>{isPositive ? 'Anchor the win:' : `Why are you feeling ${mood}?`}</Text>
        <TextInput
          style={[styles.textarea, isPositive && styles.textareaAmber]}
          multiline
          placeholder={isPositive ? 'What went right?' : "Type it out. Don't edit yourself..."}
          placeholderTextColor={Colors.mutedTeal}
          value={text}
          onChangeText={setText}
          textAlignVertical="top"
          autoFocus
        />
        <TouchableOpacity style={[styles.actionBtn, isPositive && styles.actionBtnAmber]} onPress={isPositive ? handleLockIn : handleRelease}>
          <Text style={styles.actionBtnText}>{isPositive ? 'Lock it in' : 'Release It'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── CONTROL FILTER ────────────────────────────────────────────────────────
  if (step === 'control') {
    return (
      <View style={styles.container}>
        <Text style={styles.stepTitle}>Is this situation within your direct control?</Text>
        <MotiView
          animate={burning ? { scale: 0.8, opacity: 0, translateY: -25 } : { scale: 1, opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 2500 }}
          style={styles.burnCard}
        >
          <Text style={[styles.burnText, burning && styles.burningText]}>{text}</Text>
        </MotiView>
        {!burning && (
          <View style={styles.controlBtns}>
            <TouchableOpacity style={styles.controlBtnYes} onPress={() => handleControl(true)}>
              <Text style={styles.controlBtnYesText}>Yes, I can act on it</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtnNo} onPress={() => handleControl(false)}>
              <Text style={styles.controlBtnNoText}>No, it's out of my hands</Text>
            </TouchableOpacity>
          </View>
        )}
        {burning && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 500, duration: 600 }}>
            <Text style={styles.burnMsg}>If you are sure you have done everything you can, then watch the worry burn away.</Text>
          </MotiView>
        )}
      </View>
    );
  }

  // ── REFRAME ───────────────────────────────────────────────────────────────
  if (step === 'reframe') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.centered}>
        <View style={styles.coachBubble}>
          <Text style={styles.coachLabel}>Coach Erik says:</Text>
          <Text style={styles.coachText}>{REFRAMES[mood] ?? "You've got this. One breath at a time."}</Text>
        </View>
        <TouchableOpacity style={styles.actionBtn} onPress={reset}>
          <Text style={styles.actionBtnText}>Got it. Let's move.</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ── CELEBRATION ───────────────────────────────────────────────────────────
  if (step === 'celebration') {
    return (
      <View style={styles.container}>
        <MotiView from={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' }} style={styles.celebrationContent}>
          <Text style={styles.celebrationEmoji}>🌟</Text>
          <Text style={styles.celebrationTitle}>Locked in!</Text>
          <Text style={styles.celebrationSub}>Your win has been saved to your Victory Log.</Text>
          <TouchableOpacity style={styles.actionBtn} onPress={reset}>
            <Text style={styles.actionBtnText}>Release another →</Text>
          </TouchableOpacity>
        </MotiView>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white, padding: Spacing.lg, paddingTop: 60 },
  centered: { flexGrow: 1, alignItems: 'center', paddingBottom: 40 },
  backBtn: { marginBottom: Spacing.lg },
  backText: { color: Colors.primaryBlue, fontSize: FontSizes.base, fontWeight: '500' },
  title: { fontSize: FontSizes['2xl'], fontWeight: '700', color: Colors.darkNavy, textAlign: 'center' },
  subtitle: { fontSize: FontSizes.sm, color: Colors.mutedTeal, textAlign: 'center', lineHeight: 22, marginTop: 8, marginBottom: Spacing.xl },
  trackGrid: { gap: Spacing.md, width: '100%' },
  trackCard: {
    borderWidth: 1.5,
    borderColor: Colors.lightBlue,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    gap: 8,
  },
  trackCardAmber: { borderColor: '#fde68a' },
  trackIcon: { fontSize: 32 },
  trackTitle: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.darkNavy },
  trackSub: { fontSize: FontSizes.sm, color: Colors.mutedTeal },
  stepTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.darkNavy, marginBottom: Spacing.lg },
  moodPills: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  moodPill: {
    borderWidth: 1.5,
    borderColor: Colors.lightBlue,
    borderRadius: Radius.tag,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.white,
  },
  moodPillAmber: { borderColor: '#fde68a' },
  moodPillSelected: { backgroundColor: Colors.primaryBlue, borderColor: Colors.primaryBlue },
  moodPillText: { color: Colors.darkNavy, fontWeight: '500' },
  moodPillTextSelected: { color: Colors.white },
  textarea: {
    borderWidth: 1.5,
    borderColor: Colors.lightBlue,
    borderRadius: Radius.button,
    padding: Spacing.md,
    minHeight: 140,
    fontSize: FontSizes.base,
    color: Colors.darkNavy,
    backgroundColor: '#1e293b08',
    marginBottom: Spacing.lg,
  },
  textareaAmber: { borderColor: Colors.amber, backgroundColor: '#fef3c708' },
  actionBtn: {
    backgroundColor: Colors.primaryBlue,
    borderRadius: Radius.tag,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    ...Shadows.cta,
  },
  actionBtnAmber: { backgroundColor: Colors.amber },
  actionBtnText: { color: Colors.white, fontWeight: '600', fontSize: FontSizes.base },
  burnCard: {
    backgroundColor: Colors.lightBlue,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  burnText: { fontSize: FontSizes.base, color: Colors.darkNavy, lineHeight: 24 },
  burningText: { color: Colors.amber },
  burnMsg: { fontSize: FontSizes.base, color: Colors.mutedTeal, fontStyle: 'italic', textAlign: 'center', lineHeight: 24 },
  controlBtns: { gap: Spacing.sm },
  controlBtnYes: { borderWidth: 1.5, borderColor: Colors.primaryBlue, borderRadius: Radius.tag, height: 52, alignItems: 'center', justifyContent: 'center' },
  controlBtnYesText: { color: Colors.primaryBlue, fontWeight: '600' },
  controlBtnNo: { borderWidth: 1.5, borderColor: Colors.mutedTeal, borderRadius: Radius.tag, height: 52, alignItems: 'center', justifyContent: 'center' },
  controlBtnNoText: { color: Colors.mutedTeal, fontWeight: '600' },
  coachBubble: { backgroundColor: Colors.lightBlue, borderRadius: Radius.card, padding: Spacing.lg, marginBottom: Spacing.xl, gap: 8 },
  coachLabel: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.primaryBlue },
  coachText: { fontSize: FontSizes.base, color: Colors.mutedTeal, fontStyle: 'italic', lineHeight: 26 },
  celebrationContent: { alignItems: 'center', gap: Spacing.md, flex: 1, justifyContent: 'center' },
  celebrationEmoji: { fontSize: 64 },
  celebrationTitle: { fontSize: FontSizes['3xl'], fontWeight: '700', color: Colors.darkNavy },
  celebrationSub: { fontSize: FontSizes.base, color: Colors.mutedTeal, textAlign: 'center' },
});
