import { useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Audio } from 'expo-av';
import { useAudioStore } from '../../store/useAudioStore';
import { Colors } from '../../constants/colors';

// Drop your ambient MP3 URL here (Cloudflare R2 or any HTTPS link)
const AMBIENT_URL = process.env.EXPO_PUBLIC_AMBIENT_URL ?? '';

export default function AmbientPlayer() {
  const { ambientEnabled, ambientVolume, toggleAmbient } = useAudioStore();
  const soundRef = useRef<Audio.Sound | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!AMBIENT_URL) return;

    const load = async () => {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri: AMBIENT_URL },
        { isLooping: true, volume: ambientVolume, shouldPlay: ambientEnabled },
      );
      soundRef.current = sound;
      loadedRef.current = true;
    };
    load();

    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  // Toggle play/pause when enabled changes
  useEffect(() => {
    if (!loadedRef.current || !soundRef.current) return;
    if (ambientEnabled) {
      soundRef.current.playAsync();
    } else {
      soundRef.current.pauseAsync();
    }
  }, [ambientEnabled]);

  // Adjust volume (e.g. when video plays, store sets volume to 0)
  useEffect(() => {
    soundRef.current?.setVolumeAsync(ambientEnabled ? ambientVolume : 0);
  }, [ambientVolume, ambientEnabled]);

  // Floating music toggle button — only show inside the app (not onboarding)
  if (!AMBIENT_URL) return null;

  return (
    <TouchableOpacity style={styles.btn} onPress={toggleAmbient} activeOpacity={0.8}>
      <Text style={styles.icon}>{ambientEnabled ? '🎵' : '🔇'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    zIndex: 999,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.darkNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  icon: { fontSize: 18 },
});
