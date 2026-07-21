import { View, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Home, Map, User, Zap } from '../../lib/icons';
import { MotiView } from 'moti';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/typography';
import { Shadows } from '../../constants/spacing';
import { useToolStore } from '../../store/useToolStore';

const { width: W } = Dimensions.get('window');
const FAB_SIZE   = 52;
const FAB_RIGHT  = 20;
const FAB_BOTTOM = Platform.OS === 'ios' ? 96 : 76;

const TAB_HEIGHT  = Platform.OS === 'ios' ? 88 : 64;
const TAB_PAD_BOT = Platform.OS === 'ios' ? 28 : 10;
const TAB_PAD_TOP = 8;

// Every screen that should NEVER appear as a tab.
// Expo Router registers every file in (app)/ — we must suppress each one explicitly.
const HIDDEN: string[] = [
  'tools',
  'tools/index',
  'tools/breathing',
  'tools/pomodoro',
  'tools/release',
  'tools/batching',
  'tools/havening',
  'day',
  'day/[id]',
  'victories',
  'archive',
  'archive/[id]',
];

function TabIcon({ Icon, focused }: { Icon: React.ComponentType<any>; focused: boolean }) {
  return <Icon size={22} color={focused ? Colors.tide : Colors.stone} />;
}

function ToolsFAB() {
  const router = useRouter();
  return (
    <TouchableOpacity style={styles.fab} onPress={() => router.push('/(app)/tools' as any)} activeOpacity={0.82}>
      <MotiView
        from={{ scale: 1, opacity: 0.45 }}
        animate={{ scale: 1.7, opacity: 0 }}
        transition={{ type: 'timing', duration: 1600, loop: true }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      >
        <View style={styles.fabPulseRing} />
      </MotiView>
      <Zap size={20} color={Colors.white} />
    </TouchableOpacity>
  );
}

// Routes where the bottom bar + FAB must be hidden (full-screen experiences)
const FULLSCREEN_ROUTES = ['tools', 'day', 'victories', 'archive'];

export default function AppLayout() {
  const zenMode = useToolStore((s) => s.zenMode);
  const segments = useSegments();

  // Hide bar when on any tool/day/victories route OR when zenMode is on
  const isFullscreen = zenMode || segments.some((seg) => FULLSCREEN_ROUTES.includes(seg));

  return (
    <View style={styles.root}>
      {/* Overrides the root layout's StatusBar while this screen is mounted —
          expo-status-bar merges nested instances, deepest wins. Fully hides
          the clock/battery/signal bar on immersive full-screen experiences. */}
      <StatusBar hidden={isFullscreen} animated />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: isFullscreen
            ? { display: 'none' }
            : {
                backgroundColor: Colors.white,
                borderTopColor: Colors.sandBorder,
                borderTopWidth: 1,
                height: TAB_HEIGHT,
                paddingBottom: TAB_PAD_BOT,
                paddingTop: TAB_PAD_TOP,
                elevation: 0,
                shadowOpacity: 0,
              },
          tabBarActiveTintColor:   Colors.tide,
          tabBarInactiveTintColor: Colors.stone,
          tabBarLabelStyle: { fontSize: 10, fontFamily: Fonts.bodyMedium },
        }}
      >
        {/* ── Visible tabs ── */}
        <Tabs.Screen
          name="index"
          options={{ title: 'Today', tabBarIcon: ({ focused }) => <TabIcon Icon={Home} focused={focused} /> }}
        />
        <Tabs.Screen
          name="journey"
          options={{ title: 'Journey', tabBarIcon: ({ focused }) => <TabIcon Icon={Map} focused={focused} /> }}
        />
        <Tabs.Screen
          name="profile"
          options={{ title: 'You', tabBarIcon: ({ focused }) => <TabIcon Icon={User} focused={focused} /> }}
        />

        {/* ── Hidden screens — suppress every sub-route individually ── */}
        {HIDDEN.map((name) => (
          <Tabs.Screen key={name} name={name} options={{ href: null }} />
        ))}
      </Tabs>

      {!isFullscreen && <ToolsFAB />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  fab: {
    position: 'absolute',
    bottom: FAB_BOTTOM,
    right: FAB_RIGHT,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: Colors.tide,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    ...Shadows.fab,
  },
  fabPulseRing: {
    flex: 1,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: Colors.tide,
  },
});
