/**
 * Icon shim — wraps @expo/vector-icons/Feather (Expo Go-safe, no NitroModules).
 * Matches the lucide-react-native prop API: { size, color, strokeWidth, fill }.
 * strokeWidth and fill are accepted but ignored (Feather vector icons don't expose them).
 *
 * Usage:  import { Home, Map, Check } from '../lib/icons';
 *         <Home size={22} color={Colors.tide} />
 */
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  fill?: string;
  style?: object;
}

// ── Factory helpers ────────────────────────────────────────────────────────

function feather(name: React.ComponentProps<typeof Feather>['name']) {
  return ({ size = 24, color = '#000', style }: IconProps) => (
    <Feather name={name} size={size} color={color} style={style} />
  );
}

function mci(name: React.ComponentProps<typeof MaterialCommunityIcons>['name']) {
  return ({ size = 24, color = '#000', style }: IconProps) => (
    <MaterialCommunityIcons name={name} size={size} color={color} style={style} />
  );
}

function ion(name: React.ComponentProps<typeof Ionicons>['name']) {
  return ({ size = 24, color = '#000', style }: IconProps) => (
    <Ionicons name={name} size={size} color={color} style={style} />
  );
}

// ── Navigation ─────────────────────────────────────────────────────────────
export const Home         = feather('home');
export const Map          = feather('map');
export const User         = feather('user');
export const Zap          = feather('zap');

// ── Chevrons ───────────────────────────────────────────────────────────────
export const ChevronLeft  = feather('chevron-left');
export const ChevronRight = feather('chevron-right');
export const ChevronUp    = feather('chevron-up');
export const ChevronDown  = feather('chevron-down');

// ── Actions ────────────────────────────────────────────────────────────────
export const Play         = feather('play');
export const Pause        = feather('pause');
export const X            = feather('x');
export const Check        = feather('check');
export const CheckCircle  = feather('check-circle');
export const Lock         = feather('lock');
export const Unlock       = feather('unlock');
export const Star         = feather('star');
export const Award        = feather('award');

// ── Tools ──────────────────────────────────────────────────────────────────
export const Timer        = feather('clock');
export const Layers       = feather('layers');
export const Wind         = feather('wind');
export const Moon         = feather('moon');
export const Sun          = feather('sun');
export const Coffee       = feather('coffee');
export const Inbox        = feather('inbox');
export const BookOpen     = feather('book-open');
export const Circle       = feather('circle');

// ── Shapes / emotional ─────────────────────────────────────────────────────
// Feather doesn't have waves/hand/flame/shield-check — use MaterialCommunityIcons
export const Waves        = mci('waves');
export const Hand         = mci('hand-wave-outline');
export const Flame        = mci('fire');
export const ShieldCheck  = mci('shield-check-outline');
export const Sparkles     = mci('shimmer');

// ── Profile ────────────────────────────────────────────────────────────────
export const GitBranch    = feather('git-branch');
export const Target       = feather('target');
export const Users        = feather('users');

// ── Additional ─────────────────────────────────────────────────────────────
export const Cloud        = feather('cloud');
export const Compass      = feather('compass');
export const Crosshair    = feather('crosshair');
export const RefreshCw    = feather('refresh-cw');
export const Film         = feather('film');
export const Headphones   = feather('headphones');
