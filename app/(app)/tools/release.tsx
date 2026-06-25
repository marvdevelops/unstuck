/**
 * Release Corner
 *
 * Negative track: home → mood → text → control → ceremony → reframe
 * Positive track: home → mood → text → celebration
 *
 * Ceremony: Skia particle dissolve — dust erodes card from all four edges inward,
 * background shifts from dark navy to faint teal as the worry leaves.
 */

import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, Dimensions,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import ReAnimated, {
  useSharedValue, useAnimatedStyle, withTiming, withSequence, withDelay,
  Easing as REasing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Canvas, Picture, Skia, makeImageFromView, TileMode, FilterMode, MipmapMode } from '@shopify/react-native-skia';
import { useToolStore } from '../../../store/useToolStore';
import { ChevronLeft, ChevronRight, Cloud, Star } from '../../../lib/icons';
import { Colors } from '../../../constants/colors';
import { Fonts, FontSizes } from '../../../constants/typography';
import { Spacing, Radius, Shadows } from '../../../constants/spacing';

// ── Types & data ──────────────────────────────────────────────────────────────
type Track = 'home' | 'negative' | 'positive';
type Step  = 'home' | 'mood' | 'text' | 'control' | 'ceremony' | 'reframe' | 'celebration';

const { width: W, height: H } = Dimensions.get('window');

const NEGATIVE_MOODS = ['Anxiety', 'Fear', 'Anger', 'Overwhelm', 'Impulsivity'];
const POSITIVE_MOODS = ['Joy', 'Gratitude', 'Pride', 'Hope'];

const REFRAMES: Record<string, string> = {
  Anxiety:    "Anxiety is just your brain trying to protect you from the unknown. Ground yourself in what is known right now.",
  Fear:       "This isn't hard; it's just unfamiliar. And you can navigate the unfamiliar.",
  Anger:      "You have agency over your response. Breathe into the tension and reclaim your control.",
  Overwhelm:  "Focus your air on one balloon. What's the one thing you can do right now?",
  Impulsivity:"Impulsivity is a false sense of urgency. Take a breath, break the loop, and take your power back.",
};

// ── Confetti particles (celebration step only) ────────────────────────────────
const PARTICLE_COUNT = 48;
const PARTICLE_COLORS = [
  'rgba(74,175,196,0.75)',
  'rgba(110,210,230,0.60)',
  'rgba(255,255,255,0.50)',
  'rgba(46,110,128,0.65)',
];

function generateParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x:    Math.random() * W * 0.7 + W * 0.15,
    y:    60 + Math.random() * 80,
    dx:   (Math.random() - 0.5) * W * 0.9,
    dy:   -(Math.random() * 220 + 60),
    rotate: Math.random() * 540 - 270,
    size:   Math.random() * 5 + 2,
    delay:  Math.random() * 500,
    colorIndex: i % 4,
  }));
}

function ConfettiParticle({ particle, trigger }: { particle: ReturnType<typeof generateParticles>[0]; trigger: boolean }) {
  const tx      = useSharedValue(0);
  const ty      = useSharedValue(0);
  const opacity = useSharedValue(1);
  const rotate  = useSharedValue(0);

  if (trigger) {
    tx.value      = withDelay(particle.delay, withTiming(particle.dx,     { duration: 1200, easing: REasing.out(REasing.quad) }));
    ty.value      = withDelay(particle.delay, withTiming(particle.dy,     { duration: 1200, easing: REasing.out(REasing.quad) }));
    opacity.value = withDelay(particle.delay + 600, withTiming(0,         { duration: 600 }));
    rotate.value  = withDelay(particle.delay, withTiming(particle.rotate, { duration: 1200 }));
  }

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { rotate: `${rotate.value}deg` }],
    opacity: opacity.value,
    position: 'absolute',
    left: particle.x, top: particle.y,
    width: particle.size, height: particle.size,
    borderRadius: particle.size / 2,
    backgroundColor: PARTICLE_COLORS[particle.colorIndex],
  }));

  return <ReAnimated.View style={style} />;
}

// ── Dust particle type (dissolve ceremony) ────────────────────────────────────
interface Dust {
  x: number; y: number;
  vx: number; vy: number;
  life: number; decay: number;
  r: number;
  isTeal: boolean;
  grav: number;
}

const HOLD_DURATION_MS = 2400;
// ~4 s dissolve at 60 fps
const DISSOLVE_RATE = 1 / 240;

// ── Dissolve shader (SkSL) ────────────────────────────────────────────────────
// Compiled once at module load. Implements the EXACT same noise formula as
// buildNoiseMap / spawnDustAtBand so per-pixel GPU erosion and the particle
// wavefront stay perfectly in sync. No tile grid — pure per-pixel dissolve.
//
// Uniforms (in declaration order, EXCLUDING uniform shader children):
//   dp      — float   dissolve progress [0,1]
//   size    — float2  card width, height in logical points
//   origin  — float2  card top-left in canvas space (logical points)
//   imgSize — float2  captured image physical dimensions (px)
//
// coord is in canvas space (logical pts); we subtract origin for card-local.
// image is sampled at card-local coords scaled to physical image dimensions.
//
const DISSOLVE_SHADER_SRC = `
uniform shader image;
uniform float  dp;
uniform float2 size;
uniform float2 origin;
uniform float2 imgSize;

float hash2d(float2 p) {
  return fract(sin(p.x * 127.1 + p.y * 311.7) * 43758.5453);
}

float valueNoise2d(float2 p) {
  float2 i = floor(p);
  float2 f = fract(p);
  float2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash2d(i),                    hash2d(i + float2(1.0, 0.0)), u.x),
    mix(hash2d(i + float2(0.0, 1.0)), hash2d(i + float2(1.0, 1.0)), u.x),
    u.y
  );
}

half4 main(float2 coord) {
  float2 local    = coord - origin;
  float  halfMin  = min(size.x, size.y) * 0.5;
  float  edgeDist = min(min(local.x, local.y),
                        min(size.x - local.x, size.y - local.y)) / halfMin;
  float  noise     = valueNoise2d(local * 0.025);
  float  threshold = clamp(0.7 * min(edgeDist, 1.0) + 0.3 * noise, 0.0, 1.0);
  float  vis       = threshold > dp + 0.06 ? 1.0
                   : threshold > dp        ? (threshold - dp) / 0.06
                   : 0.0;
  half4  px = image.eval(local * (imgSize / size));
  return px * vis;
}
`;

const DISSOLVE_EFFECT = (() => {
  try { return Skia.RuntimeEffect.Make(DISSOLVE_SHADER_SRC) ?? null; }
  catch (_) { return null; }
})();

// ── Smooth 2D value noise (bilinear interpolation — Bug 3 fix) ────────────────
// Using hash → bilinear interpolation with smoothstep gives correlated noise
// (adjacent pixels dissolve at similar times) instead of white noise (which
// produces blocky independent pixels). Scale 0.025 → features ~40 px wide.
function hash2d(ix: number, iy: number): number {
  const n = Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function valueNoise2d(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx); // smoothstep
  const uy = fy * fy * (3 - 2 * fy);
  return (
    hash2d(ix,     iy)     * (1 - ux) * (1 - uy) +
    hash2d(ix + 1, iy)     * ux       * (1 - uy) +
    hash2d(ix,     iy + 1) * (1 - ux) * uy       +
    hash2d(ix + 1, iy + 1) * ux       * uy
  );
}

// ── Per-pixel dissolve threshold — outer-to-inner ─────────────────────────────
// threshold[pixel] = 70% edge-distance + 30% noise
// Low threshold → dissolves early (edge pixels); high → dissolves last (centre).
function buildNoiseMap(cw: number, ch: number): Float32Array {
  const map = new Float32Array(cw * ch);
  const halfMin = Math.min(cw, ch) * 0.5;
  for (let py = 0; py < ch; py++) {
    for (let px = 0; px < cw; px++) {
      const edgeDist = Math.min(px, py, cw - 1 - px, ch - 1 - py) / halfMin;
      const noise    = valueNoise2d(px * 0.025, py * 0.025); // finer grain (Bug 3)
      map[py * cw + px] = Math.min(1, 0.7 * Math.min(edgeDist, 1) + 0.3 * noise);
    }
  }
  return map;
}

// ── Spawn dust where the dissolve wavefront currently sits ────────────────────
// Randomly samples card pixels; accepts those whose threshold ≈ dp (±band).
function spawnDustAtBand(
  noiseMap: Float32Array,
  cardRect: { x: number; y: number; w: number; h: number },
  dp: number,
  count: number,
): Dust[] {
  const BAND = 0.06;
  const { x: rx, y: ry, w: rw, h: rh } = cardRect;
  const cx = rx + rw / 2;
  const cy = ry + rh / 2;
  const particles: Dust[] = [];
  let attempts = count * 30;

  while (particles.length < count && attempts-- > 0) {
    const lpx = Math.floor(Math.random() * rw);
    const lpy = Math.floor(Math.random() * rh);
    const threshold = noiseMap[lpy * rw + lpx] ?? 0;
    if (Math.abs(threshold - dp) < BAND) {
      const wx = rx + lpx;
      const wy = ry + lpy;
      const dx = wx - cx;
      const dy = wy - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const speed = Math.random() * 0.85 + 0.3;
      particles.push({
        x: wx, y: wy,
        vx: (dx / dist) * speed * 0.65 + (Math.random() - 0.5) * 0.45,
        vy: (dy / dist) * speed * 0.60 - (Math.random() * 0.28 + 0.06),
        life: 1,
        decay: Math.random() * 0.022 + 0.012,
        r: Math.random() * 1.2 + 0.4,
        isTeal: Math.random() > 0.78,
        grav: -0.003 + Math.random() * 0.004,
      });
    }
  }
  return particles;
}

// ── Ceremony step ─────────────────────────────────────────────────────────────
//
// Two-phase architecture:
//   BEFORE dissolve: DOM card visible (native rendering), canvas idle.
//   AFTER  dissolve: DOM card INSTANTLY hidden, canvas draws card background
//                    as noise-eroded tiles + dust particles — same dp, same map.
//
function CeremonyStep({
  text,
  onComplete,
}: {
  text: string;
  onComplete: () => void;
}) {
  const cardViewRef    = useRef<any>(null);             // for makeImageFromView
  const cardRectRef    = useRef({ x: 0, y: 0, w: 200, h: 120 });
  // Noise map (card local pixels) — built from real onLayout, not Dimensions
  const noiseMapRef    = useRef<Float32Array | null>(null);
  const noiseBuiltRef  = useRef(false);
  // Shader-based dissolve — card captured as SkImage once on hold-complete
  const cardImageRef   = useRef<any>(null);
  const cardImgSizeRef = useRef({ w: 0, h: 0 });
  const shaderReadyRef = useRef(false);
  // Fallback: if capture or RuntimeEffect unavailable, fade card via DOM opacity
  const cardFadeAnim   = useRef(new Animated.Value(1)).current;

  const dustRef       = useRef<Dust[]>([]);
  const dpRef         = useRef(0);
  const dissolveRef   = useRef(false);
  const rafRef        = useRef(0);
  const holdAnimRef   = useRef<Animated.CompositeAnimation | null>(null);
  const holdTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const fillAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const [dissolveStarted, setDissolveStarted] = useState(false);
  const [domCardVisible,  setDomCardVisible]  = useState(true);
  const [holding,         setHolding]         = useState(false);
  const [showHint,        setShowHint]        = useState(false);
  const [picture,         setPicture]         = useState<any>(null);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(true), 800);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(rafRef.current);
      holdTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  // ── Capture card layout — position AND size ───────────────────────────────
  //
  // onLayout x,y are relative to the PARENT (ceremonyScreen), which is the
  // SAME coordinate system as the absoluteFill Canvas. measureInWindow would
  // give window-absolute coords that include the status-bar offset and would
  // misplace particles relative to the canvas drawing origin.
  //
  // After dissolve starts (dissolveRef=true) we FREEZE cardRectRef so that any
  // layout reflow (hint/button disappearing) does not shift the shader's draw
  // position or the particle spawner's target rect.
  //
  const handleCardLayout = (event: { nativeEvent: { layout: { x: number; y: number; width: number; height: number } } }) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      if (!dissolveRef.current) {
        cardRectRef.current = { x, y, w: width, h: height };
      }
      if (!noiseBuiltRef.current) {
        noiseBuiltRef.current = true;
        const cw = Math.ceil(width);
        const ch = Math.ceil(height);
        // Micro-task so layout paint completes before the heavy Float32Array alloc
        Promise.resolve().then(() => {
          noiseMapRef.current = buildNoiseMap(cw, ch);
        });
      }
    }
  };

  // ── Compose Skia Picture: shader-dissolved card + dust particles ──────────
  //
  // When shaderReadyRef is true the card image (captured via makeImageFromView)
  // is drawn via a SkSL RuntimeEffect that applies per-pixel noise erosion on
  // the GPU — same formula as buildNoiseMap/spawnDustAtBand so the dissolve
  // wavefront and particle spawning stay perfectly in sync.
  // If the shader isn't ready (capture failed / RuntimeEffect unsupported) the
  // DOM card fades via cardFadeAnim and this function draws particles only.
  //
  function buildPicture() {
    try {
      const dp      = dpRef.current;
      const rect    = cardRectRef.current;
      const recorder = Skia.PictureRecorder();
      const skCanvas = recorder.beginRecording(Skia.XYWHRect(0, 0, W, H));

      // ── Shader-dissolved card ───────────────────────────────────────────
      if (shaderReadyRef.current && DISSOLVE_EFFECT && cardImageRef.current) {
        try {
          const { w: imgW, h: imgH } = cardImgSizeRef.current;
          const imgShader = cardImageRef.current.makeShaderOptions(
            TileMode.Decal, TileMode.Decal, FilterMode.Linear, MipmapMode.None,
          );
          const shader = DISSOLVE_EFFECT.makeShaderWithChildren(
            // Values in SkSL declaration order (after uniform shader): dp, size(2), origin(2), imgSize(2)
            [dp, rect.w, rect.h, rect.x, rect.y, imgW, imgH],
            [imgShader],
          );
          if (shader) {
            const shaderPaint = Skia.Paint();
            shaderPaint.setShader(shader);
            skCanvas.drawRect(Skia.XYWHRect(rect.x, rect.y, rect.w, rect.h), shaderPaint);
          }
        } catch (_) { /* shader draw failed — card already hidden or fading via fallback */ }
      }

      // ── Dust particles ──────────────────────────────────────────────────
      const paint = Skia.Paint();
      for (const d of dustRef.current) {
        const alpha = (d.life * 0.75).toFixed(2);
        paint.setColor(Skia.Color(
          d.isTeal ? `rgba(74,200,220,${alpha})` : `rgba(192,210,220,${alpha})`
        ));
        const r = Math.max(0.4, d.r);
        if (r < 0.8) {
          skCanvas.drawRect(Skia.XYWHRect(d.x, d.y, r * 2, r * 2), paint);
        } else {
          skCanvas.drawCircle(d.x, d.y, r, paint);
        }
      }

      setPicture(recorder.finishRecordingAsPicture());
    } catch (_) { /* Skia unavailable — silent */ }
  }

  // ── RAF dissolve loop ─────────────────────────────────────────────────────
  function tick() {
    if (!dissolveRef.current) return;

    dpRef.current = Math.min(1, dpRef.current + DISSOLVE_RATE);
    const dp       = dpRef.current;
    const noiseMap = noiseMapRef.current;

    if (noiseMap) {
      dustRef.current.push(...spawnDustAtBand(noiseMap, cardRectRef.current, dp, Math.floor(8 + dp * 14)));
    }

    dustRef.current = dustRef.current.filter(d => {
      d.x += d.vx; d.y += d.vy; d.vy += d.grav; d.life -= d.decay;
      return d.life > 0;
    });

    buildPicture();

    if (dp < 1) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      // Wavefront complete — settle remaining particles then call onComplete
      dissolveRef.current = false;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      function settle() {
        if (dustRef.current.length > 0) {
          dustRef.current = dustRef.current.filter(d => {
            d.x += d.vx; d.y += d.vy; d.vy += d.grav; d.life -= d.decay;
            return d.life > 0;
          });
          buildPicture();
          rafRef.current = requestAnimationFrame(settle);
        }
      }
      rafRef.current = requestAnimationFrame(settle);
      holdTimersRef.current.push(setTimeout(() => {
        cancelAnimationFrame(rafRef.current);
        onComplete();
      }, 1800));
    }
  }

  // ── triggerDissolve — the handoff moment ──────────────────────────────────
  //
  // 1. Ensure noise map ready (sync fallback if async build hasn't finished).
  // 2. dissolveRef=true freezes cardRectRef so layout reflows don't shift the
  //    shader or particles after hint/button disappear.
  // 3. RAF starts immediately — particles begin spawning at dp=0 wavefront.
  // 4. makeImageFromView() captures the DOM card (~50 ms) as a SkImage.
  //      → Success: DOM card unmounts, canvas shader takes over per-pixel dissolve.
  //      → Failure: fallback to cardFadeAnim opacity animation (no GPU dissolve).
  //
  async function triggerDissolve() {
    if (!noiseMapRef.current) {
      const { w, h } = cardRectRef.current;
      noiseMapRef.current = buildNoiseMap(Math.ceil(w), Math.ceil(h));
    }

    dpRef.current = 0;
    dissolveRef.current = true; // also freezes cardRectRef in handleCardLayout
    setDissolveStarted(true);

    Animated.timing(glowAnim, { toValue: 1, duration: 4000, useNativeDriver: true }).start();
    holdTimersRef.current.push(
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 800),
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 1800),
    );
    rafRef.current = requestAnimationFrame(tick);

    // Attempt GPU shader dissolve (async — native snapshot, ~50 ms)
    if (DISSOLVE_EFFECT && cardViewRef.current) {
      try {
        const img = await makeImageFromView(cardViewRef);
        if (img) {
          cardImageRef.current    = img;
          cardImgSizeRef.current  = { w: img.width(), h: img.height() };
          shaderReadyRef.current  = true;
          setDomCardVisible(false); // canvas shader now owns the card pixels
          return;
        }
      } catch (_) { /* fall through to opacity fallback */ }
    }

    // Fallback: DOM card fades via opacity (no per-pixel dissolve)
    Animated.timing(cardFadeAnim, { toValue: 0, duration: 4000, useNativeDriver: true })
      .start(({ finished }) => { if (finished) setDomCardVisible(false); });
  }

  // ── Hold button handlers ──────────────────────────────────────────────────
  function onPressIn() {
    if (dissolveStarted) return;
    setHolding(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    holdTimersRef.current.push(
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 1200),
    );
    holdAnimRef.current = Animated.timing(fillAnim, {
      toValue: 1, duration: HOLD_DURATION_MS, useNativeDriver: false,
    });
    holdAnimRef.current.start(({ finished }) => {
      if (finished) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        triggerDissolve();
      }
    });
  }

  function onPressOut() {
    if (dissolveStarted) return;
    setHolding(false);
    holdAnimRef.current?.stop();
    holdTimersRef.current.forEach(clearTimeout);
    holdTimersRef.current = [];
    Animated.timing(fillAnim, { toValue: 0, duration: 300, useNativeDriver: false }).start();
  }

  const fillWidth = fillAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 170] });

  return (
    <View style={styles.ceremonyScreen}>

      {/* Layer 1 — Teal glow (absoluteFill, no touch) */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.ceremonyGlowWrap, { opacity: glowAnim }]}
        pointerEvents="none"
      />

      {/* Layer 2 — DOM card: present until shader is ready (canvas then takes over).
           ref={cardViewRef} lets makeImageFromView snapshot background + text together.
           Falls back to cardFadeAnim opacity animation if capture / RuntimeEffect fails. */}
      {domCardVisible && (
        <Animated.View
          ref={cardViewRef}
          style={[styles.ceremonyCard, { opacity: cardFadeAnim }]}
          onLayout={handleCardLayout}
        >
          <Text style={styles.ceremonyCardText}>{text}</Text>
        </Animated.View>
      )}

      {/* Layer 3 — Skia canvas: shader-dissolved card + particles (zIndex 3, no touch) */}
      <Canvas style={[StyleSheet.absoluteFill, { zIndex: 3 }]} pointerEvents="none">
        {picture && <Picture picture={picture} />}
      </Canvas>

      {/* Layer 10+ — Hint text (above canvas) */}
      {showHint && !dissolveStarted && (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 600 }}
          style={[styles.ceremonyHintWrap, { zIndex: 10 }]}
        >
          <Text style={styles.ceremonyHint}>
            {holding ? 'Keep holding...' : 'Hold to release it.'}
          </Text>
        </MotiView>
      )}

      {/* Layer 10+ — Hold button (overflow:'hidden' clips fill to pill shape) */}
      {!dissolveStarted && (
        <TouchableOpacity
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={1}
          style={[styles.holdBtn, holding && styles.holdBtnActive, { zIndex: 10 }]}
        >
          {/* Fill bar — NO borderRadius; parent overflow:'hidden' clips it */}
          <Animated.View style={[styles.holdFill, { width: fillWidth }]} pointerEvents="none">
            <LinearGradient
              colors={['rgba(46,110,128,0.55)', 'rgba(74,175,196,0.65)']}
              start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
          <Text style={[styles.holdBtnText, holding && styles.holdBtnTextActive]}>
            {holding ? 'Keep holding...' : 'Hold to let go'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Shared back button ────────────────────────────────────────────────────────
function BackBtn({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.backBtn} hitSlop={12}>
      <ChevronLeft size={18} color={Colors.tideMid} strokeWidth={2} />
      <Text style={styles.backText}>Back</Text>
    </TouchableOpacity>
  );
}

// ── Shared gradient CTA ───────────────────────────────────────────────────────
function GradientBtn({
  label, onPress, variant = 'tide',
}: {
  label: string; onPress: () => void; variant?: 'tide' | 'gold';
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={{ width: '100%' }}>
      <LinearGradient
        colors={variant === 'gold' ? Colors.gradients.ctaGold : Colors.gradients.cta}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.gradientBtn}
      >
        <Text style={styles.gradientBtnText}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ReleaseScreen() {
  const router         = useRouter();
  const insets         = useSafeAreaInsets();
  const { addVictory } = useToolStore();

  const [track,    setTrack]    = useState<Track>('home');
  const [step,     setStep]     = useState<Step>('home');
  const [mood,     setMood]     = useState('');
  const [text,     setText]     = useState('');
  const [particles]             = useState(generateParticles);

  const handleNegativeTrack = () => { setTrack('negative'); setStep('mood'); };
  const handlePositiveTrack = () => { setTrack('positive'); setStep('mood'); };

  const handleMoodSelect = (m: string) => {
    setMood(m);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep('text');
  };

  const handleRelease  = () => { if (!text.trim()) return; setStep('control'); };
  const handleLockIn   = async () => {
    if (!text.trim()) return;
    await addVictory({ mood, text, date: new Date().toISOString() });
    setStep('celebration');
  };

  const handleControl = (canControl: boolean) => {
    if (canControl) {
      setStep('reframe');
    } else {
      // Begin the release ceremony
      setStep('ceremony');
    }
  };

  const reset = () => {
    setTrack('home'); setStep('home'); setMood(''); setText('');
  };

  const topPad = { paddingTop: insets.top + 16 };

  // ── HOME ───────────────────────────────────────────────────────────────────
  if (step === 'home') {
    return (
      <View style={[styles.screen, topPad]}>
        <BackBtn onPress={() => router.back()} />

        <View style={styles.homeHeader}>
          <Text style={styles.pageTitle}>Release Corner</Text>
          <Text style={styles.pageSubtitle}>
            Your brain is a processor, not a storage drive.{'\n'}
            Let's process what's on your mind right now.
          </Text>
        </View>

        <View style={styles.trackGrid}>
          <TouchableOpacity style={styles.trackCard} onPress={handleNegativeTrack} activeOpacity={0.82}>
            <View style={[styles.trackIconWrap, { backgroundColor: 'rgba(74,175,196,0.12)' }]}>
              <Cloud size={22} color={Colors.tideMid} />
            </View>
            <View style={styles.trackCardBody}>
              <Text style={styles.trackTitle}>Something's weighing on me</Text>
              <Text style={styles.trackSub}>Process anxiety, fear, anger, or overwhelm.</Text>
            </View>
            <ChevronRight size={16} color={Colors.darkFaint} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.trackCard, styles.trackCardGold]} onPress={handlePositiveTrack} activeOpacity={0.82}>
            <View style={[styles.trackIconWrap, { backgroundColor: 'rgba(200,146,58,0.15)' }]}>
              <Star size={22} color={Colors.gold} />
            </View>
            <View style={styles.trackCardBody}>
              <Text style={styles.trackTitle}>Something good happened</Text>
              <Text style={styles.trackSub}>Anchor a win, joy, pride, or hope.</Text>
            </View>
            <ChevronRight size={16} color={Colors.darkFaint} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── MOOD ───────────────────────────────────────────────────────────────────
  if (step === 'mood') {
    const moods  = track === 'negative' ? NEGATIVE_MOODS : POSITIVE_MOODS;
    const isGold = track === 'positive';
    return (
      <View style={[styles.screen, topPad]}>
        <BackBtn onPress={reset} />
        <Text style={styles.stepTitle}>
          {isGold ? "What's the energy today?" : 'How are you feeling right now?'}
        </Text>
        <Text style={styles.stepHint}>Tap the one that fits best.</Text>
        <View style={styles.moodPills}>
          {moods.map((m) => {
            const selected = mood === m;
            return (
              <TouchableOpacity
                key={m}
                onPress={() => handleMoodSelect(m)}
                activeOpacity={0.8}
                style={[
                  styles.moodPill,
                  selected && (isGold ? styles.moodPillGold : styles.moodPillTide),
                ]}
              >
                <Text style={[styles.moodPillText, selected && styles.moodPillTextSelected]}>
                  {m}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  // ── TEXT ENTRY ─────────────────────────────────────────────────────────────
  if (step === 'text') {
    const isGold = track === 'positive';
    return (
      <KeyboardAvoidingView
        style={[styles.screen, topPad]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <BackBtn onPress={() => setStep('mood')} />
        <Text style={styles.stepTitle}>
          {isGold ? 'Anchor the win.' : 'Why are you feeling that way?'}
        </Text>
        <Text style={styles.stepHint}>
          {isGold ? 'Describe what went right.' : "Don't edit yourself. Just pour it out."}
        </Text>
        <TextInput
          style={styles.textarea}
          multiline
          placeholder={isGold ? 'What went right...' : 'Type it out...'}
          placeholderTextColor={Colors.darkFaint}
          value={text}
          onChangeText={setText}
          textAlignVertical="top"
          autoFocus
        />
        <GradientBtn
          label={isGold ? 'Lock it in' : 'Release it'}
          onPress={isGold ? handleLockIn : handleRelease}
          variant={isGold ? 'gold' : 'tide'}
        />
      </KeyboardAvoidingView>
    );
  }

  // ── CONTROL FILTER ─────────────────────────────────────────────────────────
  if (step === 'control') {
    return (
      <View style={[styles.screen, topPad, styles.centered]}>
        {/* Card — static display for context */}
        <View style={styles.controlCard}>
          <Text style={styles.controlCardText}>{text}</Text>
        </View>

        <View style={styles.controlSection}>
          <Text style={styles.controlQuestion}>Is this within your direct control?</Text>
          <View style={styles.controlBtns}>
            <TouchableOpacity
              style={styles.controlBtnYes}
              onPress={() => handleControl(true)}
              activeOpacity={0.82}
            >
              <LinearGradient
                colors={Colors.gradients.cta}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.controlBtnInner}
              >
                <Text style={styles.controlBtnYesText}>Yes, I can act on it</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlBtnNo}
              onPress={() => handleControl(false)}
              activeOpacity={0.82}
            >
              <Text style={styles.controlBtnNoText}>No, it's out of my hands</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // ── CEREMONY ───────────────────────────────────────────────────────────────
  if (step === 'ceremony') {
    return (
      <CeremonyStep
        text={text}
        onComplete={() => setStep('reframe')}
      />
    );
  }

  // ── REFRAME ────────────────────────────────────────────────────────────────
  if (step === 'reframe') {
    return (
      <View style={[styles.screen, topPad, styles.centered]}>
        <MotiView
          from={{ opacity: 0, scale: 0.92, translateY: 14 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: 'spring', stiffness: 140, damping: 18 }}
          style={styles.coachBubble}
        >
          <Text style={styles.coachLabel}>Coach Erik</Text>
          <Text style={styles.coachText}>
            {REFRAMES[mood] ?? "You've got this. One breath at a time."}
          </Text>
        </MotiView>

        <GradientBtn label="Got it. Let's move." onPress={reset} />
      </View>
    );
  }

  // ── CELEBRATION ────────────────────────────────────────────────────────────
  if (step === 'celebration') {
    return (
      <View style={[styles.screen, topPad, styles.centered]}>
        {particles.slice(0, 24).map((p) => (
          <ConfettiParticle key={p.id} particle={{ ...p, dy: -(Math.random() * 280 + 100) }} trigger />
        ))}

        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 16 }}
          style={styles.celebContent}
        >
          <LinearGradient
            colors={Colors.gradients.ctaGold}
            start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}
            style={styles.celebIconWrap}
          >
            <Star size={32} color={Colors.white} strokeWidth={1.5} />
          </LinearGradient>

          <Text style={styles.celebTitle}>Locked in.</Text>
          <Text style={styles.celebSub}>Your win has been saved to your Victory Log.</Text>

          <GradientBtn label="Release another →" onPress={reset} variant="gold" />
        </MotiView>
      </View>
    );
  }

  return null;
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.darkBase,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  centered: { justifyContent: 'center' },

  // Back button
  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginBottom: Spacing.lg, alignSelf: 'flex-start',
  },
  backText: {
    fontFamily: Fonts.bodyMedium, fontSize: FontSizes.sm, color: Colors.tideMid,
  },

  // Gradient CTA
  gradientBtn: {
    height: 56, borderRadius: Radius.tag,
    alignItems: 'center', justifyContent: 'center', ...Shadows.cta,
  },
  gradientBtnText: {
    fontFamily: Fonts.bodyBold, fontSize: FontSizes.base, color: Colors.white,
  },

  // ── HOME ──────────────────────────────────────────────────────────────────
  homeHeader: { marginBottom: Spacing.xl },
  pageTitle: {
    fontFamily: Fonts.displayItalic, fontSize: FontSizes['3xl'],
    color: Colors.white, marginBottom: Spacing.sm,
  },
  pageSubtitle: {
    fontFamily: Fonts.body, fontSize: FontSizes.sm,
    color: Colors.darkMuted, lineHeight: 22,
  },
  trackGrid: { gap: Spacing.md, flex: 1, justifyContent: 'center' },
  trackCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.darkSurface, borderWidth: 1,
    borderColor: Colors.darkBorder, borderRadius: Radius.card, padding: Spacing.lg,
  },
  trackCardGold: {
    borderColor: 'rgba(200,146,58,0.25)', backgroundColor: 'rgba(200,146,58,0.06)',
  },
  trackIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  trackCardBody: { flex: 1, gap: 4 },
  trackTitle: { fontFamily: Fonts.bodyBold, fontSize: FontSizes.base, color: Colors.darkText },
  trackSub: { fontFamily: Fonts.body, fontSize: FontSizes.sm, color: Colors.darkMuted, lineHeight: 20 },

  // ── MOOD ──────────────────────────────────────────────────────────────────
  stepTitle: { fontFamily: Fonts.displayItalic, fontSize: FontSizes.xl, color: Colors.white, marginBottom: 6 },
  stepHint: { fontFamily: Fonts.body, fontSize: FontSizes.sm, color: Colors.darkMuted, marginBottom: Spacing.xl },
  moodPills: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, flex: 1, alignContent: 'flex-start' },
  moodPill: {
    borderWidth: 1.5, borderColor: Colors.darkBorder, borderRadius: Radius.tag,
    paddingHorizontal: 18, paddingVertical: 11, backgroundColor: Colors.darkSurface,
  },
  moodPillTide: { borderColor: Colors.tide, backgroundColor: 'rgba(46,110,128,0.20)' },
  moodPillGold: { borderColor: Colors.gold, backgroundColor: 'rgba(200,146,58,0.18)' },
  moodPillText: { fontFamily: Fonts.bodyMedium, fontSize: FontSizes.sm, color: Colors.darkMuted },
  moodPillTextSelected: { color: Colors.white, fontFamily: Fonts.bodyBold },

  // ── TEXT ENTRY ────────────────────────────────────────────────────────────
  textarea: {
    flex: 1, borderWidth: 1.5, borderColor: Colors.darkBorder,
    borderRadius: Radius.card, padding: Spacing.md,
    fontSize: FontSizes.lg, fontFamily: Fonts.displayLightItalic,
    color: Colors.white, backgroundColor: Colors.darkSurface,
    lineHeight: 32, marginBottom: Spacing.lg,
  },

  // ── CONTROL ───────────────────────────────────────────────────────────────
  controlCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: Colors.darkBorder,
    borderRadius: Radius.card, padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  controlCardText: {
    fontFamily: Fonts.displayLightItalic, fontSize: FontSizes.base,
    color: Colors.darkText, lineHeight: 26,
  },
  controlSection: { width: '100%', gap: Spacing.md },
  controlQuestion: {
    fontFamily: Fonts.displayItalic, fontSize: FontSizes.xl,
    color: Colors.white, textAlign: 'center', lineHeight: 32, marginBottom: Spacing.sm,
  },
  controlBtns: { gap: Spacing.sm },
  controlBtnYes: { borderRadius: Radius.tag, overflow: 'hidden', ...Shadows.cta },
  controlBtnInner: { height: 54, alignItems: 'center', justifyContent: 'center' },
  controlBtnYesText: { fontFamily: Fonts.bodyBold, fontSize: FontSizes.base, color: Colors.white },
  controlBtnNo: {
    height: 54, borderWidth: 1.5, borderColor: Colors.darkBorder,
    borderRadius: Radius.tag, alignItems: 'center', justifyContent: 'center',
  },
  controlBtnNoText: { fontFamily: Fonts.bodyMedium, fontSize: FontSizes.base, color: Colors.darkMuted },

  // ── CEREMONY ──────────────────────────────────────────────────────────────
  ceremonyScreen: {
    flex: 1,
    backgroundColor: '#0a1520',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  ceremonyGlowWrap: {
    // Radial glow simulated as a full-screen teal tint
    backgroundColor: 'rgba(46,110,128,0.18)',
  },
  ceremonyCard: {
    width: W * 0.74,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 22,
  },
  ceremonyCardText: {
    fontFamily: Fonts.displayLightItalic,
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.70)',
    lineHeight: 22,
    textAlign: 'center',
  },
  ceremonyHintWrap: { alignItems: 'center' },
  ceremonyHint: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 0.5,
  },
  holdBtn: {
    height: 50,
    width: 170,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',      // clips fill to pill shape — key property
    alignItems: 'center',
    justifyContent: 'center',
  },
  holdBtnActive: {
    borderColor: 'rgba(74,175,196,0.65)',
  },
  holdFill: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    // NO borderRadius — parent overflow:'hidden' clips to pill
  },
  holdBtnText: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.5,
    zIndex: 1,
  },
  holdBtnTextActive: {
    color: 'rgba(255,255,255,0.82)',
  },

  // ── REFRAME ───────────────────────────────────────────────────────────────
  coachBubble: {
    backgroundColor: Colors.darkSurface, borderRadius: Radius.card,
    borderWidth: 1, borderColor: Colors.darkBorder,
    padding: Spacing.lg, gap: Spacing.sm,
    width: '100%', marginBottom: Spacing.xl,
  },
  coachLabel: {
    fontFamily: Fonts.mono, fontSize: FontSizes.xs,
    color: Colors.gold, letterSpacing: 2.5, textTransform: 'uppercase',
  },
  coachText: {
    fontFamily: Fonts.displayItalic, fontSize: FontSizes.xl,
    color: Colors.darkText, lineHeight: 34,
  },

  // ── CELEBRATION ───────────────────────────────────────────────────────────
  celebContent: { alignItems: 'center', gap: Spacing.md, width: '100%' },
  celebIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm,
    shadowColor: Colors.gold, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.40, shadowRadius: 12, elevation: 8,
  },
  celebTitle: { fontFamily: Fonts.displayItalic, fontSize: FontSizes['3xl'], color: Colors.white },
  celebSub: {
    fontFamily: Fonts.body, fontSize: FontSizes.base,
    color: Colors.darkMuted, textAlign: 'center', lineHeight: 24, marginBottom: Spacing.sm,
  },
});
