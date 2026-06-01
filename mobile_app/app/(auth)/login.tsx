import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  Alert,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Colors, Radii, Spacing, FontSize } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Background orbs */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand */}
          <View style={styles.brandRow}>
            <View style={styles.brandLogo}>
              <Text style={styles.brandIcon}>⚡</Text>
            </View>
            <Text style={styles.brandName}>GigToGeek</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>Sign in to your account</Text>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠  {error}</Text>
              </View>
            ) : null}

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={(v) => { setEmail(v); setError(''); }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                returnKeyType="next"
              />
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={(v) => { setPassword(v); setError(''); }}
                secureTextEntry
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>Sign in</Text>
              }
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>Create one →</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* Live badge */}
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>2,400+ gig workers saving smarter</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  orb1: {
    position: 'absolute',
    width: 380, height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(59,130,246,0.10)',
    top: -100, left: -100,
  },
  orb2: {
    position: 'absolute',
    width: 320, height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(139,92,246,0.08)',
    bottom: -80, right: -80,
  },
  kav:  { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },

  // Brand
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Spacing.xl,
    alignSelf: 'center',
  },
  brandLogo: {
    width: 40, height: 40,
    borderRadius: 12,
    backgroundColor: Colors.accent1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accent1,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  brandIcon: { fontSize: 20 },
  brandName: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },

  // Card
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  cardHeader: { gap: 4, marginBottom: 4 },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Error
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
    padding: Spacing.sm + 4,
  },
  errorText: { color: '#fca5a5', fontSize: FontSize.sm, fontWeight: '500' },

  // Fields
  fieldGroup: { gap: 6 },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.sm,
    padding: Spacing.sm + 4,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },

  // Button
  btn: {
    backgroundColor: Colors.accent1,
    borderRadius: Radii.sm,
    padding: Spacing.sm + 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent1,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 5,
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    color: '#fff',
    fontSize: FontSize.base,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Footer
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  footerText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  footerLink: { fontSize: FontSize.sm, color: Colors.accent1, fontWeight: '700' },

  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
    marginTop: Spacing.lg,
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  badgeDot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  badgeText: { fontSize: FontSize.xs, color: Colors.textSecondary },
});
