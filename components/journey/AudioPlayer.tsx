import { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, LayoutChangeEvent } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { useIsFocused } from '@react-navigation/native';
import { useAudioStore } from '../../store/useAudioStore';
import { Colors } from '../../constants/colors';
import { FontSizes, Fonts } from '../../constants/typography';
import { Radius, Spacing } from '../../constants/spacing';
import { Play, Pause, Check, Headphones } from '../../lib/icons';

// Static require map — Metro needs literal paths at bundle time
const AUDIO_ASSETS: Record<number, any> = {
  1:  require('../../assets/audio/day_1.mp3'),
  2:  require('../../assets/audio/day_2.mp3'),
  3:  require('../../assets/audio/day_3.mp3'),
  4:  require('../../assets/audio/day_4.mp3'),
  5:  require('../../assets/audio/day_5.mp3'),
  6:  require('../../assets/audio/day_6.mp3'),
  7:  require('../../assets/audio/day_7.mp3'),
  8:  require('../../assets/audio/day_8.mp3'),
  9:  require('../../assets/audio/day_9.mp3'),
  10: require('../../assets/audio/day_10.mp3'),
  11: require('../../assets/audio/day_11.mp3'),
  12: require('../../assets/audio/day_12.mp3'),
  13: require('../../assets/audio/day_13.mp3'),
  14: require('../../assets/audio/day_14.mp3'),
  15: require('../../assets/audio/day_15.mp3'),
  16: require('../../assets/audio/day_16.mp3'),
  17: require('../../assets/audio/day_17.mp3'),
  18: require('../../assets/audio/day_18.mp3'),
  19: require('../../assets/audio/day_19.mp3'),
  20: require('../../assets/audio/day_20.mp3'),
  21: require('../../assets/audio/day_21.mp3'),
};

interface Props {
  dayNum: number;
  watched: boolean;
  onMarkWatched: () => void;
}

const fmt = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export default function AudioPlayer({ dayNum, watched, onMarkWatched }: Props) {
  const setAmbientVolume = useAudioStore((s) => s.setAmbientVolume);
  const soundRef = useRef<Audio.Sound | null>(null);
  const trackWidthRef = useRef(0);
  const isFocused = useIsFocused();

  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [loading, setLoading] = useState(false);

  const progress = durationMs > 0 ? positionMs / durationMs : 0;

  const onStatus = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setIsPlaying(status.isPlaying);
    setPositionMs(status.positionMillis ?? 0);
    if (status.durationMillis) setDurationMs(status.durationMillis);
    setAmbientVolume(status.isPlaying ? 0 : 0.2);
  }, []);

  // Auto-mark listened at 90%
  useEffect(() => {
    if (!watched && progress >= 0.9 && durationMs > 0) onMarkWatched();
  }, [progress, watched]);

  // Tab screens stay mounted when you navigate away (React Navigation
  // doesn't unmount them), so unmount-based cleanup never fires. Pause
  // explicitly whenever this screen loses focus.
  useEffect(() => {
    if (!isFocused) {
      soundRef.current?.pauseAsync();
    }
  }, [isFocused]);

  // Load audio on mount
  useEffect(() => {
    let mounted = true;
    const asset = AUDIO_ASSETS[dayNum];
    if (!asset) return;

    (async () => {
      setLoading(true);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });
      const { sound } = await Audio.Sound.createAsync(asset, { shouldPlay: false }, onStatus);
      if (mounted) {
        soundRef.current = sound;
        setLoading(false);
      } else {
        sound.unloadAsync();
      }
    })();

    return () => {
      mounted = false;
      soundRef.current?.unloadAsync();
      soundRef.current = null;
      setAmbientVolume(0.2);
    };
  }, [dayNum]);

  const togglePlay = async () => {
    const sound = soundRef.current;
    if (!sound || loading) return;
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      // If finished, restart
      if (progress >= 0.99) await sound.setPositionAsync(0);
      await sound.playAsync();
    }
  };

  const seekTo = async (e: any) => {
    const sound = soundRef.current;
    if (!sound || durationMs === 0) return;
    const { locationX } = e.nativeEvent;
    const ratio = Math.min(Math.max(locationX / trackWidthRef.current, 0), 1);
    await sound.setPositionAsync(Math.floor(ratio * durationMs));
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Headphones size={16} color={Colors.mutedTeal} />
        <Text style={styles.label}>Day {dayNum} · Voice Over</Text>
      </View>

      {/* Play / Pause button */}
      <TouchableOpacity style={styles.playBtn} onPress={togglePlay} activeOpacity={0.8}>
        {isPlaying
          ? <Pause size={28} color={Colors.white} fill={Colors.white} />
          : <Play  size={28} color={Colors.white} fill={Colors.white} />
        }
      </TouchableOpacity>

      {/* Progress bar */}
      <Pressable
        onPress={seekTo}
        onLayout={(e: LayoutChangeEvent) => { trackWidthRef.current = e.nativeEvent.layout.width; }}
        style={styles.track}
      >
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        <View style={[styles.thumb, { left: `${progress * 100}%` }]} />
      </Pressable>

      {/* Time */}
      <View style={styles.timeRow}>
        <Text style={styles.time}>{fmt(positionMs)}</Text>
        <Text style={styles.time}>{durationMs > 0 ? fmt(durationMs) : '--:--'}</Text>
      </View>

      {/* Mark listened */}
      <TouchableOpacity
        style={[styles.listenedBtn, watched && styles.listenedBtnActive]}
        onPress={onMarkWatched}
      >
        {watched && <Check size={13} color={Colors.white} />}
        <Text style={[styles.listenedText, watched && styles.listenedTextActive]}>
          {watched ? 'Listened' : 'Mark Listened'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.darkNavy,
    borderRadius: Radius.button,
    padding: Spacing.lg,
    gap: 14,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  label: {
    color: Colors.mutedTeal,
    fontSize: FontSizes.sm,
    fontFamily: Fonts.mono,
    letterSpacing: 0.5,
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  track: {
    width: '100%',
    height: 20,
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    height: 4,
    backgroundColor: Colors.primaryBlue,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.white,
    top: 4,
    marginLeft: -6,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: -8,
  },
  time: { fontSize: FontSizes.xs, color: Colors.mutedTeal, fontFamily: Fonts.mono },
  listenedBtn: {
    borderWidth: 1.5,
    borderColor: Colors.mutedTeal,
    borderRadius: Radius.tag,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 6,
    alignSelf: 'stretch',
  },
  listenedBtnActive: { backgroundColor: Colors.primaryBlue, borderColor: Colors.primaryBlue },
  listenedText: { color: Colors.mutedTeal, fontWeight: '600', fontSize: FontSizes.sm },
  listenedTextActive: { color: Colors.white },
});
