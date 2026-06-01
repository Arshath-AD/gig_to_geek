import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radii, Spacing, FontSize } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────
interface SavingsGoal {
  id: number; title: string; target_amount: number;
  current_amount: number; status: 'active' | 'completed' | 'paused';
}
interface AIInsight {
  id: number; insight_type: string; title: string;
  body: string; confidence_score: number | null; is_read: boolean;
}

// ── Sub-components ────────────────────────────────────────────
function StatCard({ icon, label, value, accent }: {
  icon: string; label: string; value: string; accent: string;
}) {
  return (
    <View style={[styles.statCard, { borderLeftColor: accent }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );
}

function GoalCard({ goal }: { goal: SavingsGoal }) {
  const pct = goal.target_amount > 0
    ? Math.min((goal.current_amount / goal.target_amount) * 100, 100)
    : 0;

  const statusColor = goal.status === 'active' ? Colors.success
    : goal.status === 'completed' ? Colors.accent1 : Colors.warning;

  return (
    <View style={styles.goalCard}>
      <View style={styles.goalHeader}>
        <Text style={styles.goalTitle} numberOfLines={1}>{goal.title}</Text>
        <View style={[styles.statusPill, { backgroundColor: `${statusColor}22`, borderColor: `${statusColor}55` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{goal.status}</Text>
        </View>
      </View>
      <Text style={styles.goalAmounts}>
        <Text style={styles.goalCurrent}>₹{goal.current_amount.toLocaleString()}</Text>
        <Text style={styles.goalSep}> / </Text>
        <Text style={styles.goalTarget}>₹{goal.target_amount.toLocaleString()}</Text>
      </Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
      </View>
      <Text style={styles.goalPct}>{pct.toFixed(1)}% saved</Text>
    </View>
  );
}

function InsightCard({ insight }: { insight: AIInsight }) {
  return (
    <View style={[styles.insightCard, !insight.is_read && styles.insightUnread]}>
      <View style={styles.insightTypePill}>
        <Text style={styles.insightTypeText}>{insight.insight_type.toUpperCase()}</Text>
      </View>
      <Text style={styles.insightTitle}>{insight.title}</Text>
      <Text style={styles.insightBody} numberOfLines={3}>{insight.body}</Text>
      {insight.confidence_score != null && (
        <View style={styles.confRow}>
          <Text style={styles.confLabel}>Confidence</Text>
          <View style={styles.confBar}>
            <View style={[styles.confFill, { width: `${(insight.confidence_score * 100).toFixed(0)}%` as any }]} />
          </View>
          <Text style={styles.confLabel}>{(insight.confidence_score * 100).toFixed(0)}%</Text>
        </View>
      )}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────
export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [goals, setGoals]           = useState<SavingsGoal[]>([]);
  const [insights, setInsights]     = useState<AIInsight[]>([]);
  const [loadingGoals, setLG]       = useState(true);
  const [loadingInsights, setLI]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setLG(true); setLI(true);
    try {
      const [g, i] = await Promise.allSettled([
        api.get('/savings-goals/'),
        api.get('/insights/'),
      ]);
      if (g.status === 'fulfilled') setGoals(g.value.data.slice(0, 3));
      if (i.status === 'fulfilled') setInsights(i.value.data.slice(0, 3));
    } finally {
      setLG(false); setLI(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const firstName = user?.full_name?.split(' ')[0] ?? 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const QUICK_ACTIONS = [
    { icon: '💸', label: 'Log Income' },
    { icon: '🧾', label: 'Expense' },
    { icon: '🏦', label: 'Save Now' },
    { icon: '🧠', label: 'AI Nudge' },
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.appName}>GigToGeek</Text>
          {user?.is_superuser && (
            <View style={styles.superBadge}>
              <Text style={styles.superText}>⚡ Admin</Text>
            </View>
          )}
        </View>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent1} />}
      >
        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>
            {greeting},{' '}
            <Text style={styles.greetingName}>{firstName}</Text>
            {' '}👋
          </Text>
          <Text style={styles.greetingSub}>
            {user?.occupation ? `${user.occupation} · ` : ''}Here's your snapshot.
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatCard icon="💰" label="Monthly Income"
            value={user?.monthly_income_estimate ? `₹${Number(user.monthly_income_estimate).toLocaleString()}` : '—'}
            accent={Colors.accent1} />
          <StatCard icon="🎯" label="Active Goals"
            value={loadingGoals ? '…' : String(goals.length)}
            accent={Colors.accent2} />
          <StatCard icon="🤖" label="AI Insights"
            value={loadingInsights ? '…' : String(insights.length)}
            accent={Colors.accent3} />
          <StatCard icon="✅" label="Status"
            value={user?.is_active ? 'Active' : 'Inactive'}
            accent={Colors.success} />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.qaGrid}>
          {QUICK_ACTIONS.map(a => (
            <TouchableOpacity key={a.label} style={styles.qaCard} activeOpacity={0.8}>
              <Text style={styles.qaIcon}>{a.icon}</Text>
              <Text style={styles.qaLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Savings Goals */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Savings Goals</Text>
          <TouchableOpacity>
            <Text style={styles.sectionAction}>+ Add</Text>
          </TouchableOpacity>
        </View>
        {loadingGoals ? (
          <ActivityIndicator color={Colors.accent1} style={{ marginVertical: 24 }} />
        ) : goals.length > 0 ? (
          goals.map(g => <GoalCard key={g.id} goal={g} />)
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyText}>No savings goals yet. Create your first!</Text>
          </View>
        )}

        {/* AI Insights */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI Insights</Text>
          <View style={styles.aiPill}>
            <Text style={styles.aiPillText}>Powered by AI</Text>
          </View>
        </View>
        {loadingInsights ? (
          <ActivityIndicator color={Colors.accent2} style={{ marginVertical: 24 }} />
        ) : insights.length > 0 ? (
          insights.map(i => <InsightCard key={i.id} insight={i} />)
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🤖</Text>
            <Text style={styles.emptyText}>No insights yet. Keep using GigToGeek!</Text>
          </View>
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgPrimary },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    backgroundColor: 'rgba(8,12,20,0.95)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  appName: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.5 },
  superBadge: {
    backgroundColor: 'rgba(245,158,11,0.15)', borderRadius: Radii.full,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)', paddingHorizontal: 10, paddingVertical: 2,
  },
  superText: { fontSize: FontSize.xs, color: '#fbbf24', fontWeight: '700' },
  avatarWrap: {},
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.accent1, justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.accent1, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: FontSize.base },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: 40, gap: Spacing.sm },

  // Greeting
  greetingSection: { marginBottom: Spacing.sm },
  greetingText: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.5 },
  greetingName: { color: Colors.accent1 },
  greetingSub: { fontSize: FontSize.base, color: Colors.textSecondary, marginTop: 4 },

  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: Spacing.sm },
  statCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.bgCard, borderRadius: Radii.md,
    borderWidth: 1, borderColor: Colors.border,
    borderLeftWidth: 3, padding: Spacing.sm + 4,
    width: '47%',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
  },
  statIcon: { fontSize: 24 },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, marginTop: 2 },

  // Quick Actions
  qaGrid: { flexDirection: 'row', gap: 10, marginBottom: Spacing.sm },
  qaCard: {
    flex: 1, backgroundColor: Colors.bgCard, borderRadius: Radii.md,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', paddingVertical: Spacing.md, gap: 6,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
  },
  qaIcon:  { fontSize: 26 },
  qaLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600', textAlign: 'center' },

  // Section headers
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.sm + 4, marginBottom: Spacing.sm },
  sectionTitle:  { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  sectionAction: { fontSize: FontSize.sm, color: Colors.accent1, fontWeight: '600' },
  aiPill: {
    backgroundColor: 'rgba(139,92,246,0.1)', borderRadius: Radii.full,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.25)', paddingHorizontal: 10, paddingVertical: 3,
  },
  aiPillText: { fontSize: FontSize.xs, color: Colors.accent2, fontWeight: '700', letterSpacing: 0.5 },

  // Goals
  goalCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radii.lg,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, gap: 8, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
  },
  goalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  goalTitle:   { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  statusPill:  { borderRadius: Radii.full, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 2 },
  statusText:  { fontSize: FontSize.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  goalAmounts: { fontSize: FontSize.lg },
  goalCurrent: { fontWeight: '700', color: Colors.textPrimary },
  goalSep:     { color: Colors.textMuted },
  goalTarget:  { color: Colors.textSecondary, fontWeight: '500' },
  progressBar: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  progressFill:{ height: '100%', borderRadius: 3, backgroundColor: Colors.accent1 },
  goalPct:     { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '500' },

  // Insights
  insightCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radii.lg,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, gap: 8, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
  },
  insightUnread: { borderColor: 'rgba(139,92,246,0.35)' },
  insightTypePill: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(139,92,246,0.1)',
    borderRadius: Radii.full, borderWidth: 1, borderColor: 'rgba(139,92,246,0.25)',
    paddingHorizontal: 10, paddingVertical: 3,
  },
  insightTypeText: { fontSize: FontSize.xs, color: Colors.accent2, fontWeight: '700', letterSpacing: 0.7 },
  insightTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  insightBody:  { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  confRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  confLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  confBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  confFill: { height: '100%', borderRadius: 2, backgroundColor: Colors.accent3 },

  // Empty
  emptyBox: { alignItems: 'center', paddingVertical: Spacing.xl, gap: 8 },
  emptyIcon: { fontSize: 36 },
  emptyText: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center' },

  // Logout
  logoutBtn: {
    marginTop: Spacing.md, borderRadius: Radii.sm,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.sm + 4, alignItems: 'center',
  },
  logoutText: { fontSize: FontSize.base, color: Colors.textSecondary, fontWeight: '500' },
});
