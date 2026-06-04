import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { useAudioStore } from '../../store/useAudioStore';
import { Colors } from '../../constants/colors';
import { FontSizes } from '../../constants/typography';
import { Radius } from '../../constants/spacing';

interface Props {
  uri: string | undefined;
  dayNum: number;
  watched: boolean;
  onMarkWatched: () => void;
}

export default function VideoPlayer({ uri, dayNum, watched, onMarkWatched }: Props) {
  const setAmbientVolume = useAudioStore((s) => s.setAmbientVolume);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<Video>(null);

  const handleStatus = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    const dur = status.durationMillis ? status.durationMillis / 1000 : 0;
    const pos = status.positionMillis ? status.positionMillis / 1000 : 0;
    if (dur > 0) {
      setDuration(dur);
      setProgress(pos / dur);
    }
    // Dim ambient when playing, restore when paused
    setAmbientVolume(status.isPlaying ? 0 : 0.2);
  };

  // Auto-mark watched at 90% completion
  useEffect(() => {
    if (!watched && progress >= 0.9) onMarkWatched();
  }, [progress, watched]);

  const fmt = (secs: number) =>
    `${Math.floor(secs / 60)}:${String(Math.floor(secs % 60)).padStart(2, '0')}`;

  const WatchedButton = () => (
    <TouchableOpacity
      style={[styles.watchedBtn, watched && styles.watchedBtnActive]}
      onPress={onMarkWatched}
    >
      <Text style={[styles.watchedBtnText, watched && styles.watchedBtnTextActive]}>
        {watched ? '✓ Watched' : 'Mark Watched'}
      </Text>
    </TouchableOpacity>
  );

  if (!uri) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderIcon}>🎬</Text>
        <Text style={styles.placeholderText}>Day {dayNum} video not yet uploaded.</Text>
        <Text style={styles.placeholderSub}>Upload to Cloudflare R2 and add the URL to curriculum.ts</Text>
        <WatchedButton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri }}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        useNativeControls
        onPlaybackStatusUpdate={handleStatus}
      />

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{fmt(duration * progress)}</Text>
        <Text style={styles.timeText}>{fmt(duration)}</Text>
      </View>

      <WatchedButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: Radius.button,
    backgroundColor: Colors.darkNavy,
    overflow: 'hidden',
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.lightBlue,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: 4, backgroundColor: Colors.primaryBlue, borderRadius: 2 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  timeText: { fontSize: FontSizes.xs, color: Colors.mutedTeal },
  watchedBtn: {
    borderWidth: 1.5,
    borderColor: Colors.mutedTeal,
    borderRadius: Radius.tag,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  watchedBtnActive: { backgroundColor: Colors.primaryBlue, borderColor: Colors.primaryBlue },
  watchedBtnText: { color: Colors.mutedTeal, fontWeight: '600', fontSize: FontSizes.sm },
  watchedBtnTextActive: { color: Colors.white },
  placeholder: {
    backgroundColor: Colors.darkNavy,
    borderRadius: Radius.button,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    minHeight: 180,
    justifyContent: 'center',
  },
  placeholderIcon: { fontSize: 36 },
  placeholderText: { color: Colors.white75, fontSize: FontSizes.base, textAlign: 'center' },
  placeholderSub: { color: Colors.white45, fontSize: FontSizes.xs, textAlign: 'center', lineHeight: 18 },
});
