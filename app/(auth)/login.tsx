import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { useAuthStore } from '../../store/useAuthStore';
import { useUserStore } from '../../store/useUserStore';
import { Colors } from '../../constants/colors';
import { FontSizes } from '../../constants/typography';
import { Spacing, Radius, Shadows } from '../../constants/spacing';

export default function Login() {
  const router = useRouter();
  const { login, loading, error, clearError } = useAuthStore();
  const onboardingComplete = useUserStore((s) => s.onboardingComplete);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) return;
    clearError();
    await login(email.trim(), password);
    const user = useAuthStore.getState().user;
    if (user) {
      router.replace(onboardingComplete ? '/(app)/' : '/(auth)/welcome');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ duration: 500 }}>
        <Text style={styles.logo}>unstuck21™</Text>
        <Text style={styles.headline}>Welcome back.</Text>
        <Text style={styles.sub}>Sign in to continue your journey.</Text>
      </MotiView>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Colors.mutedTeal}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="next"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={Colors.mutedTeal}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />

        {error && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Text style={styles.errorText}>{error}</Text>
          </MotiView>
        )}

        <TouchableOpacity
          style={[styles.btn, (!email || !password || loading) && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={!email || !password || loading}
          activeOpacity={0.85}
        >
          {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.btnText}>Sign In</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.switchLink}>
          <Text style={styles.switchText}>No account yet? <Text style={styles.switchAccent}>Create one →</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkNavy, paddingHorizontal: Spacing.lg, paddingTop: 100, paddingBottom: 40 },
  logo: { color: Colors.white, fontSize: 22, fontWeight: '700', letterSpacing: 1, marginBottom: Spacing.md },
  headline: { color: Colors.white, fontSize: FontSizes['3xl'], fontWeight: '600', lineHeight: 40 },
  sub: { color: Colors.white75, fontSize: FontSizes.base, marginTop: 6, marginBottom: Spacing.xl },
  form: { gap: Spacing.md },
  input: {
    backgroundColor: Colors.white08,
    borderWidth: 1,
    borderColor: Colors.white12,
    borderRadius: Radius.button,
    height: 52,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.base,
    color: Colors.white,
  },
  errorText: { color: '#f87171', fontSize: FontSizes.sm, textAlign: 'center' },
  btn: {
    backgroundColor: Colors.primaryBlue,
    borderRadius: Radius.tag,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    ...Shadows.cta,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: Colors.white, fontWeight: '600', fontSize: FontSizes.base },
  switchLink: { alignItems: 'center', marginTop: Spacing.sm },
  switchText: { color: Colors.white45, fontSize: FontSizes.sm },
  switchAccent: { color: Colors.primaryBlue },
});
