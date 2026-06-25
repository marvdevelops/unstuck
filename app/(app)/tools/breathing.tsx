/**
 * Box Breathing — 4·4·4·4
 *
 * 3-2-1 countdown → animation begins at RISE_START (Inhale).
 * Phase label derived from cycleT — always in sync with the wave.
 */

import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { Colors } from '../../../constants/colors';
import { Fonts, FontSizes } from '../../../constants/typography';

// ── Constants ─────────────────────────────────────────────────────────────────
const { width: W, height: H } = Dimensions.get('window');

const CYCLE_DUR_MS = 16000;   // 16 s per full box-breathing cycle
const TOTAL_CYCLES = 4;
const SHOW_EXIT_MS = 28000;

const MID_Y  = H * 0.58;
const AMP    = H * 0.090;
const PERIOD = W * 1.5;
const ORB_R  = 26;

const RISE_START = 0.10, RISE_END   = 0.40;
const FALL_START = 0.60, FALL_END   = 0.90;

// cycleT offset so the animation always begins at the Inhale phase
const INHALE_OFFSET = RISE_START * CYCLE_DUR_MS;   // 1600 ms

const PHASE_NAMES = ['Inhale', 'Hold', 'Exhale', 'Hold'] as const;

// ── Math ──────────────────────────────────────────────────────────────────────

function ss5(t: number): number {
  t = Math.max(0, Math.min(1, t));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function profileCT(ct: number): number {
  ct = ((ct % 1) + 1) % 1;
  if (ct < RISE_START) return -1;
  if (ct <= RISE_END)  return -1 + 2 * ss5((ct - RISE_START) / (RISE_END - RISE_START));
  if (ct < FALL_START) return  1;
  if (ct <= FALL_END)  return  1 - 2 * ss5((ct - FALL_START) / (FALL_END - FALL_START));
  return -1;
}

const TAPER = 0.15;
function ripple(x: number, t: number, ct: number): number {
  ct = ((ct % 1) + 1) % 1;
  const inRise = ct >= RISE_START && ct <= RISE_END;
  const inFall = ct >= FALL_START && ct <= FALL_END;
  if (!inRise && !inFall) return 0;
  let w = 1;
  const p = inRise
    ? (ct - RISE_START) / (RISE_END - RISE_START)
    : (ct - FALL_START) / (FALL_END - FALL_START);
  if (p < TAPER)       w = p / TAPER;
  else if (p > 1 - TAPER) w = (1 - p) / TAPER;
  return w * (
    Math.sin(x * 0.034 + t * 1.8) * 0.030 +
    Math.sin(x * 0.020 - t * 1.3 + 1.1) * 0.016
  );
}

function buildWavePath(cycleT: number, gfxT: number, ctOffset: number, ampScale: number) {
  const path = Skia.Path.Make();
  path.moveTo(0, H);
  for (let x = 0; x <= W; x += 2) {
    const ct  = cycleT + (x - W * 0.5) / PERIOD + ctOffset;
    const val = profileCT(ct) + ripple(x, gfxT, ct);
    path.lineTo(x, MID_Y - val * AMP * ampScale);
  }
  path.lineTo(W, H);
  path.close();
  return path;
}

/** Phase label derived from wave position — always in sync. */
function getPhaseIdx(ct: number): number {
  ct = ((ct % 1) + 1) % 1;
  if (ct < RISE_START) return 3; // flat bottom → Hold
  if (ct < RISE_END)   return 0; // rising      → Inhale
  if (ct < FALL_START) return 1; // flat top    → Hold
  if (ct < FALL_END)   return 2; // falling     → Exhale
  return 3;                       // flat bottom → Hold
}

// Static paths at the Inhale start position (bottom of wave)
const STATIC_FRONT = buildWavePath(RISE_START, 0, 0,    1);
const STATIC_BACK  = buildWavePath(RISE_START, 0, 0.08, 0.72);
// Ball Y at the Inhale start: profile = -1 → surfaceY = MID_Y + AMP
const BALL_START_Y = MID_Y + AMP - ORB_R;

// ── Component ─────────────────────────────────────────────────────────────────
export default function BreathingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [counting,  setCounting]  = useState(true);
  const [countNum,  setCountNum]  = useState(3);
  const [phaseIdx,  setPhaseIdx]  = useState(0);    // 0=Inhale at start
  const [cycles,    setCycles]    = useState(0);
  const [showExit,  setShowExit]  = useState(false);

  const [frontPath, setFrontPath] = useState(() => STATIC_FRONT);
  const [backPath,  setBackPath]  = useState(() => STATIC_BACK);

  const ballY          = useSharedValue(BALL_START_Y);
  const ballVY         = useRef(0);
  const startTimeRef   = useRef<number>(0);
  const gfxTimeRef     = useRef<number>(0);
  const rafRef         = useRef<number>(0);
  const prevTsRef      = useRef<number>(0);
  const prevCycleTRef  = useRef<number>(RISE_START);

  // ── Animation frame ─────────────────────────────────────────────────────────
  function tick(ts: number) {
    const dt = Math.min((ts - (prevTsRef.current || ts)) / 1000, 0.033);
    prevTsRef.current = ts;

    const elapsed = ts - startTimeRef.current;
    // Offset so elapsed=0 maps to cycleT=RISE_START (Inhale begins immediately)
    const cycleT = ((elapsed + INHALE_OFFSET) % CYCLE_DUR_MS) / CYCLE_DUR_MS;

    gfxTimeRef.current += dt;
    const gfxT = gfxTimeRef.current;

    setFrontPath(buildWavePath(cycleT, gfxT, 0,    1));
    setBackPath( buildWavePath(cycleT, gfxT, 0.08, 0.72));

    // Phase label synced with wave
    setPhaseIdx(getPhaseIdx(cycleT));

    // Detect full-cycle wrap (cycleT jumps from ~1 → ~RISE_START)
    if (cycleT < prevCycleTRef.current - 0.5) {
      setCycles((c) => Math.min(c + 1, TOTAL_CYCLES));
    }
    prevCycleTRef.current = cycleT;

    // Spring ball: center on wave surface at W/2
    const surfaceVal = profileCT(cycleT) + ripple(W * 0.5, gfxT, cycleT);
    const surfaceY   = MID_Y - surfaceVal * AMP;
    const targetY    = surfaceY - ORB_R;

    ballVY.current += (-20 * (ballY.value - targetY) - 7 * ballVY.current) * dt;
    ballY.value    += ballVY.current * dt;

    rafRef.current = requestAnimationFrame(tick);
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // 3 → 2 → 1 → GO
    timers.push(setTimeout(() => setCountNum(2), 1000));
    timers.push(setTimeout(() => setCountNum(1), 2000));
    timers.push(setTimeout(() => {
      setCounting(false);
      // Start animation — cycleT will immediately be RISE_START → Inhale
      startTimeRef.current  = performance.now();
      prevTsRef.current     = 0;
      prevCycleTRef.current = RISE_START;
      gfxTimeRef.current    = 0;
      rafRef.current = requestAnimationFrame(tick);
    }, 3000));

    timers.push(setTimeout(() => setShowExit(true), 3000 + SHOW_EXIT_MS));

    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const ballStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: ballY.value }],
  }));

  const beatDots = ['·', '·', '·', '·'].map((_, i) => i < phaseIdx ? '●' : '·').join(' ');

  return (
    <View style={styles.root}>
      <StatusBar hidden />

      {/* Wave canvas */}
      <Canvas style={StyleSheet.absoluteFill}>
        <Path path={backPath}  color="rgba(28,77,92,0.40)"   style="fill" />
        <Path path={frontPath} color="rgba(74,175,196,0.64)" style="fill" />
      </Canvas>

      {/* Ball */}
      <Animated.View style={[styles.ball, ballStyle]} />

      {/* ── Countdown overlay ── */}
      {counting && (
        <View style={styles.countdownOverlay}>
          <MotiView
            key={countNum}
            from={{ opacity: 0, scale: 1.25 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 250 }}
          >
            <Text style={styles.countNumber}>{countNum}</Text>
          </MotiView>
          <Text style={styles.countLabel}>get ready</Text>
        </View>
      )}

      {/* ── Phase label (shown once animation starts) ── */}
      {!counting && (
        <MotiView
          key={phaseIdx}
          from={{ opacity: 0, translateY: 4 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          style={[styles.phaseWrap, { top: insets.top + 44 }]}
        >
          <Text style={styles.phaseName}>{PHASE_NAMES[phaseIdx]}</Text>
          <Text style={styles.phaseBeats}>{beatDots}</Text>
        </MotiView>
      )}

      {/* Cycle dots — top right (hidden during countdown) */}
      {!counting && (
        <View style={[styles.cycleDots, { top: insets.top + 48 }]}>
          {Array.from({ length: TOTAL_CYCLES }).map((_, i) => (
            <View key={i} style={[styles.cycleDot, i < cycles && styles.cycleDotDone]} />
          ))}
        </View>
      )}

      {/* Exit button */}
      {showExit && (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 2000 }}
          style={styles.exitWrap}
        >
          <TouchableOpacity style={styles.exitBtn} onPress={() => router.replace('/(app)/')}>
            <Text style={styles.exitBtnText}>I'm ready</Text>
          </TouchableOpacity>
        </MotiView>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.darkBase,
  },

  ball: {
    position: 'absolute',
    left: W / 2 - ORB_R,
    top: 0,
    width:  ORB_R * 2,
    height: ORB_R * 2,
    borderRadius: ORB_R,
    backgroundColor: 'rgba(255,255,255,0.92)',
    zIndex: 9,
  },

  // Countdown
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  countNumber: {
    fontFamily: Fonts.mono,
    fontSize: 60,
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 70,
    textAlign: 'center',
    letterSpacing: 4,
  },
  countLabel: {
    fontFamily: Fonts.mono,
    fontSize: FontSizes.xs,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.28)',
    marginTop: 4,
  },

  // Phase label
  phaseWrap: {
    position: 'absolute',
    left: 0, right: 0,
    alignItems: 'center',
  },
  phaseName: {
    fontFamily: Fonts.mono,
    fontSize: FontSizes.xs,
    letterSpacing: 3.5,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.38)',
  },
  phaseBeats: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    letterSpacing: 3,
    color: 'rgba(255,255,255,0.18)',
    marginTop: 4,
  },

  // Cycle dots
  cycleDots: {
    position: 'absolute',
    right: 20,
    flexDirection: 'column',
    gap: 5,
  },
  cycleDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  cycleDotDone: {
    height: 12,
    backgroundColor: Colors.tideMid,
    borderRadius: 2,
  },

  // Exit
  exitWrap: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
  },
  exitBtn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 14,
    paddingHorizontal: 44,
  },
  exitBtnText: {
    fontFamily: Fonts.displayLightItalic,
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.28)',
  },
});
