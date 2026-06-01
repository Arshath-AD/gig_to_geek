import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Colors, Radii, Spacing, FontSize } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';

const OCCUPATIONS = [
  'Freelancer', 'Rideshare Driver', 'Delivery Partner', 'Content Creator',
  'Tutor / Educator', 'Graphic Designer', 'Software Developer', 'Student', 'Other',
];

export default function SignupScreen() {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    full_name: '', email: '', password: '', confirmPassword: '',
    occupation: '', monthly_income_estimate: '',
  });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);
  const [occOpen, setOccOpen]   = useState(false);

  const set = (key: keyof typeof form) => (val: string) => {
    setForm(f => ({ ...f, [key]: val }));
    setError('');
  };

  const validate = () => {
    if (!form.full_name.trim()) return 'Full name is required.';
    if (!form.email.trim()) return 'Email is required.';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email.';
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleRegister = async () => {
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    try {
      await register({
        full_name:               form.full_name.trim(),
        email:                   form.email.trim(),
        password:                form.password,
        occupation:              form.occupation || null,
        monthly_income_estimate: form.monthly_income_estimate
          ? parseFloat(form.monthly_income_estimate) : null,
      });
      setSuccess(true);
      setTimeout(() => router.replace('/(auth)/login'), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

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
              <Text style={styles.title}>Create account</Text>
              <Text style={styles.subtitle}>Start micro-saving on every gig</Text>
            </View>

            {/* Error / Success */}
            {error ? (
              <View style={styles.alertBox}>
                <Text style={styles.alertError}>⚠  {error}</Text>
              </View>
            ) : null}
            {success ? (
              <View style={[styles.alertBox, styles.alertSuccessBox]}>
                <Text style={styles.alertSuccess}>✓  Account created! Redirecting…</Text>
              </View>
            ) : null}

            {/* Full name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Full name</Text>
              <TextInput style={styles.input} placeholder="Alex Johnson"
                placeholderTextColor={Colors.textMuted} value={form.full_name}
                onChangeText={set('full_name')} autoCapitalize="words" />
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email address</Text>
              <TextInput style={styles.input} placeholder="you@example.com"
                placeholderTextColor={Colors.textMuted} value={form.email}
                onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" />
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput style={styles.input} placeholder="Min 8 characters"
                placeholderTextColor={Colors.textMuted} value={form.password}
                onChangeText={set('password')} secureTextEntry />
            </View>

            {/* Confirm */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirm password</Text>
              <TextInput style={styles.input} placeholder="Repeat password"
                placeholderTextColor={Colors.textMuted} value={form.confirmPassword}
                onChangeText={set('confirmPassword')} secureTextEntry />
            </View>

            {/* Occupation picker */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Occupation <Text style={styles.optional}>(optional)</Text></Text>
              <TouchableOpacity
                style={[styles.input, styles.picker]}
                onPress={() => setOccOpen(v => !v)}
              >
                <Text style={form.occupation ? styles.pickerValue : styles.pickerPlaceholder}>
                  {form.occupation || 'Select occupation ▾'}
                </Text>
              </TouchableOpacity>
              {occOpen && (
                <View style={styles.dropdown}>
                  {OCCUPATIONS.map(occ => (
                    <TouchableOpacity
                      key={occ}
                      style={[styles.dropdownItem, form.occupation === occ && styles.dropdownItemActive]}
                      onPress={() => { set('occupation')(occ); setOccOpen(false); }}
                    >
                      <Text style={[styles.dropdownText, form.occupation === occ && styles.dropdownTextActive]}>
                        {occ}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Monthly income */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Monthly income <Text style={styles.optional}>(optional)</Text></Text>
              <TextInput style={styles.input} placeholder="e.g. 35000"
                placeholderTextColor={Colors.textMuted} value={form.monthly_income_estimate}
                onChangeText={set('monthly_income_estimate')} keyboardType="numeric" />
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.btn, (loading || success) && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={loading || success}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>{success ? 'Account Created ✓' : 'Create Account'}</Text>
              }
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>Sign in →</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>Free forever · No credit card required</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgPrimary },
  orb1: {
    position: 'absolute', width: 380, height: 380, borderRadius: 190,
    backgroundColor: 'rgba(59,130,246,0.09)', top: -100, left: -100,
  },
  orb2: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(139,92,246,0.07)', bottom: -60, right: -60,
  },
  scroll: { flexGrow: 1, padding: Spacing.lg, paddingBottom: 40 },

  brandRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginBottom: Spacing.xl, alignSelf: 'center', marginTop: Spacing.md,
  },
  brandLogo: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.accent1, justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.accent1, shadowOpacity: 0.5, shadowRadius: 10, elevation: 6,
  },
  brandIcon: { fontSize: 20 },
  brandName: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.5 },

  card: {
    backgroundColor: Colors.bgCard, borderRadius: Radii.xl,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg, gap: Spacing.md,
    shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 20, elevation: 8,
  },
  cardHeader: { gap: 4, marginBottom: 4 },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center' },

  alertBox: {
    backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: Radii.sm,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)', padding: Spacing.sm + 2,
  },
  alertSuccessBox: {
    backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.25)',
  },
  alertError: { color: '#fca5a5', fontSize: FontSize.sm, fontWeight: '500' },
  alertSuccess: { color: '#6ee7b7', fontSize: FontSize.sm, fontWeight: '500' },

  fieldGroup: { gap: 6 },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 0.3 },
  optional: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '400' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1,
    borderColor: Colors.border, borderRadius: Radii.sm,
    padding: Spacing.sm + 4, fontSize: FontSize.base, color: Colors.textPrimary,
  },

  picker: { justifyContent: 'center' },
  pickerValue: { fontSize: FontSize.base, color: Colors.textPrimary },
  pickerPlaceholder: { fontSize: FontSize.base, color: Colors.textMuted },
  dropdown: {
    backgroundColor: '#1e293b', borderRadius: Radii.sm,
    borderWidth: 1, borderColor: Colors.border, marginTop: -8, overflow: 'hidden',
  },
  dropdownItem: { padding: Spacing.sm + 4, borderBottomWidth: 1, borderBottomColor: Colors.border },
  dropdownItemActive: { backgroundColor: 'rgba(59,130,246,0.15)' },
  dropdownText: { fontSize: FontSize.base, color: Colors.textSecondary },
  dropdownTextActive: { color: Colors.accent1, fontWeight: '600' },

  btn: {
    backgroundColor: Colors.accent1, borderRadius: Radii.sm,
    padding: Spacing.sm + 5, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.accent1, shadowOpacity: 0.4, shadowRadius: 12,
    elevation: 5, marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: FontSize.base, fontWeight: '700', letterSpacing: 0.3 },

  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  footerText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  footerLink: { fontSize: FontSize.sm, color: Colors.accent1, fontWeight: '700' },

  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center',
    marginTop: Spacing.lg, backgroundColor: Colors.bgCard, borderRadius: Radii.full,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 16, paddingVertical: 8,
  },
  badgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  badgeText: { fontSize: FontSize.xs, color: Colors.textSecondary },
});
