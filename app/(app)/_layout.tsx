import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/typography';
import { useToolStore } from '../../store/useToolStore';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

export default function AppLayout() {
  const zenMode = useToolStore((s) => s.zenMode);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: zenMode
          ? { display: 'none' }
          : {
              backgroundColor: Colors.white,
              borderTopColor: Colors.lightBlue,
              borderTopWidth: 1,
              height: 64,
              paddingBottom: 8,
            },
        tabBarActiveTintColor: Colors.primaryBlue,
        tabBarInactiveTintColor: Colors.mutedTeal,
        tabBarLabelStyle: { fontSize: 11, fontFamily: Fonts.bodyMedium },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="journey"
        options={{
          title: 'Journey',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📅" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
