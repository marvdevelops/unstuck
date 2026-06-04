import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { useAuthStore } from '../../store/useAuthStore';
import { Colors } from '../../constants/colors';
import { FontSizes } from '../../constants/typography';
import { Spacing, Radius, Shadows } from '../../constants/spacing';

export default function Register() {
  const router = useRouter();
  const { register, loading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState('');

  const handleRegister = async () => {
    setLocalError('');
    clearError();
    if (!email.trim() || !password) { setLocalError('Email and password required.'); return; }
    if (password.length < 8) { setLocalError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setLocalError('Passwords do not match.'); return; }

    await register(email.trim(), password);
    const user = useAuthStore.getState().user;
    if (user) router.replace('/(auth)/welcome');
  };

  const displayError = localError || error;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ duration: 500 }}>
          <Text style={styles.logo}>unstuck21™</Text>
          <Text style={styles.headline}>Create your account.</Text>
          <Text style={styles.sub}>Your 21-day journey starts here.</Text>
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
            placeholder="Password (min 8 characters)"
            placeholderTextColor={Colors.mutedTeal}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="next"
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            placeholderTextColor={Colors.mutedTeal}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />

          {displayError && (
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Text style={styles.errorText}>{displayError}</Text>
            </MotiView>
          )}

          <TouchableOpacity
            style={[styles.btn, (!email || !password || !confirm || loading) && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={!email || !password || !confirm || loading}
            activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.btnText}>Create Account</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.switchLink}>
            <Text style={styles.switchText}>Already have an account? <Text style={styles.switchAccent}>Sign in →</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkNavy },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: 100, paddingBottom: 40 },
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
