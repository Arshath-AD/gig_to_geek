import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, Radii, Spacing } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const fields = [
    { label: 'Full Name',   value: user?.full_name ?? '—' },
    { label: 'Email',       value: user?.email ?? '—' },
    { label: 'Occupation',  value: user?.occupation ?? 'Not set' },
    { label: 'Monthly Income', value: user?.monthly_income_estimate
        ? `₹${Number(user.monthly_income_estimate).toLocaleString()}` : 'Not set' },
    { label: 'Account Status', value: user?.is_active ? 'Active ✅' : 'Inactive' },
    { label: 'Role', value: user?.is_superuser ? '⚡ Super Admin' : 'User' },
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.full_name?.charAt(0).toUpperCase() ?? '?'}
            </Text>
          </View>
          <Text style={styles.displayName}>{user?.full_name}</Text>
          {user?.is_superuser && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminText}>⚡ Super Admin</Text>
            </View>
          )}
        </View>

        {/* Info rows */}
        <View style={styles.card}>
          {fields.map((f, i) => (
            <View key={f.label} style={[styles.row, i < fields.length - 1 && styles.rowBorder]}>
              <Text style={styles.rowLabel}>{f.label}</Text>
              <Text style={styles.rowValue} numberOfLines={1}>{f.value}</Text>
            </View>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: {
    padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },

  content: { padding: Spacing.lg, gap: Spacing.lg },

  avatarWrap: { alignItems: 'center', gap: 10 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.accent1, justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.accent1, shadowOpacity: 0.5, shadowRadius: 16, elevation: 8,
  },
  avatarText:  { color: '#fff', fontSize: FontSize.xxl, fontWeight: '700' },
  displayName: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  adminBadge: {
    backgroundColor: 'rgba(245,158,11,0.15)', borderRadius: Radii.full,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)', paddingHorizontal: 14, paddingVertical: 4,
  },
  adminText: { fontSize: FontSize.sm, color: '#fbbf24', fontWeight: '700' },

  card: {
    backgroundColor: Colors.bgCard, borderRadius: Radii.lg,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 4,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  rowValue: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: '500', maxWidth: '55%', textAlign: 'right' },

  logoutBtn: {
    borderRadius: Radii.sm, borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.sm + 4, alignItems: 'center',
  },
  logoutText: { fontSize: FontSize.base, color: Colors.textSecondary, fontWeight: '500' },
});
