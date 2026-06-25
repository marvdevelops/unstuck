import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Fonts, FontSizes } from '../../constants/typography';
import { Spacing, Radius } from '../../constants/spacing';
import ProgressDots from '../../components/ui/ProgressDots';

const { width } = Dimensions.get('window');

export default function Welcome() {
  const router = useRouter();

  return (
    <LinearGradient colors={Colors.gradients.onboardBg} style={styles.container}>
      {/* Atmospheric sphere — top-bleed with light-source gradient */}
      <MotiView
        from={{ scale: 1, opacity: 0.55 }}
        animate={{ scale: 1.12, opacity: 0.80 }}
        transition={{ type: 'timing', duration: 5000, easing: Easing.inOut(Easing.sin), loop: true, repeatReverse: true }}
        style={styles.sphere}
      >
        <LinearGradient
          colors={['#4AAFC4', '#2E6E80', '#1C4D5C']}
          start={{ x: 0.25, y: 0.10 }}
          end={{ x: 0.80, y: 0.90 }}
          style={{ flex: 1, borderRadius: 999 }}
        />
      </MotiView>

      <ProgressDots total={5} current={1} style={styles.dots} />

      <View style={styles.content}>
        {/* Logo placeholder */}
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 600 }}>
          <Text style={styles.logo}>unstuck21™</Text>
          <Text style={styles.tagline}>The Limitless Journey</Text>
        </MotiView>

        <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 400, duration: 600 }}>
          <Text style={styles.headline}>You've been here before.</Text>
        </MotiView>

        <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 800, duration: 600 }}>
          <Text style={styles.body}>
            That feeling of knowing exactly what you should be doing — and not being able to make yourself do it.{'\n\n'}
            It's not a discipline problem.{'\n'}
            It's a nervous system problem.{'\n'}
            And it has a solution.
          </Text>
          <Text style={styles.subtext}>
            Unstuck 21 is a 21-day compounding habit program built on neuroscience, NLP, and one surprisingly simple truth: you don't need more motivation. You need a smaller first step.
          </Text>
        </MotiView>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>Takes 60 seconds</Text>
        </View>
      </View>

      <MotiView
        from={{ opacity: 0, translateY: 24 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 1200, duration: 500 }}
        style={styles.ctaWrapper}
      >
        <TouchableOpacity onPress={() => router.push('/(auth)/diagnosis')} activeOpacity={0.85}>
          <LinearGradient
            colors={Colors.gradients.cta}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.cta}
          >
            <Text style={styles.ctaText}>I'm ready. Let's go. →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </MotiView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },
  sphere: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    top: -width * 0.28,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  dots: { marginBottom: Spacing.lg },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.lg },
  logo: { color: Colors.white, fontSize: 28, textAlign: 'center', fontFamily: Fonts.display, letterSpacing: 1 },
  tagline: { color: Colors.white45, fontSize: FontSizes.sm, textAlign: 'center', marginTop: 4, fontFamily: Fonts.body },
  headline: {
    color: Colors.white,
    fontSize: FontSizes.hero,
    textAlign: 'center',
    fontFamily: Fonts.displayItalic,
    lineHeight: 54,
    marginTop: Spacing.lg,
  },
  body: {
    color: Colors.white75,
    fontSize: FontSizes.base,
    textAlign: 'center',
    lineHeight: 26,
    marginTop: Spacing.md,
    fontFamily: Fonts.body,
  },
  subtext: {
    color: Colors.white45,
    fontSize: FontSizes.xs,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: Spacing.md,
    fontFamily: Fonts.body,
  },
  badge: {
    borderWidth: 1,
    borderColor: Colors.amber,
    borderRadius: Radius.tag,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: Spacing.md,
  },
  badgeText: { color: Colors.amber, fontSize: FontSizes.xs, fontFamily: Fonts.bodyMedium },
  ctaWrapper: { width: '100%' },
  cta: {
    borderRadius: Radius.tag,
    height: 56,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.tide,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaText: { color: Colors.white, fontSize: FontSizes.base, fontFamily: Fonts.bodyBold },
});
