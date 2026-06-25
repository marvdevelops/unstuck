/**
 * No-op stub for expo-video in Expo Go.
 * expo-video v3 uses NitroModules and is not Expo Go-compatible.
 * Use expo-av (Video component) instead — see components/journey/VideoPlayer.tsx.
 */
'use strict';

const React = require('react');
const { View } = require('react-native');

module.exports = {
  VideoView: () => null,
  VideoAirPlayButton: () => null,
  useVideoPlayer: () => null,
  createVideoPlayer: () => null,
  isPictureInPictureSupported: () => false,
  clearVideoCacheAsync: () => Promise.resolve(),
  setVideoCacheSizeAsync: () => Promise.resolve(),
  getCurrentVideoCacheSize: () => 0,
};
