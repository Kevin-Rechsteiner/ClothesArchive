import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { Screen } from '@/components/ui/screen';
import { Radius, Spacing, isClothAvailable } from '@/constants/theme';
import { getAllClothes } from '@/db/queries';
import { useAppTheme } from '@/hooks/use-app-theme';

function StatCard({ label, value, hint, accent, accentBg }: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: string;
  accentBg?: string;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.statCard, { backgroundColor: accentBg ?? colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.statValue, { color: accent ?? colors.text }]}>{value}</Text>
      {hint ? <Text style={[styles.statHint, { color: colors.textMuted }]}>{hint}</Text> : null}
    </View>
  );
}

export default function OverviewScreen() {
  const { colors } = useAppTheme();
  const [clothes, setClothes] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      setClothes(getAllClothes() as any[]);
    }, [])
  );

  const stats = useMemo(() => {
    const available = clothes.filter((c) => isClothAvailable(c.wash_status)).length;

    // Count items per category, sorted by most items first
    const catCounts: Record<string, number> = {};
    for (const c of clothes) {
      if (c.category) catCounts[c.category] = (catCounts[c.category] ?? 0) + 1;
    }
    const topCategories = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return { available, inLaundry: clothes.length - available, topCategories };
  }, [clothes]);

  return (
    <Screen title="Übersicht" subtitle="Ein schneller Blick auf deinen Kleiderschrank">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <StatCard label="Gesamt" value={clothes.length} hint="Kleidungsstücke im Archiv" />
          <StatCard
            label="Verfügbar" value={stats.available} hint="Sofort tragbar"
            accent={colors.success} accentBg={colors.successSoft}
          />
          <StatCard
            label="In Wäsche" value={stats.inLaundry} hint="Nicht verfügbar"
            accent={colors.warning} accentBg={colors.warningSoft}
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Kategorien</Text>
          {stats.topCategories.length === 0 ? (
            <Text style={[styles.sectionEmpty, { color: colors.textSecondary }]}>
              Noch keine Kategorien vorhanden.
            </Text>
          ) : (
            stats.topCategories.map(([category, count]) => (
              <View key={category} style={[styles.row, { borderBottomColor: colors.border }]}>
                <Text style={[styles.rowLabel, { color: colors.text }]}>{category}</Text>
                <View style={[styles.countBadge, { backgroundColor: colors.accentSoft }]}>
                  <Text style={[styles.countBadgeText, { color: colors.accent }]}>{count}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statCard: {
    flexGrow: 1,
    minWidth: '30%',
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  statHint: {
    fontSize: 12,
    lineHeight: 16,
  },
  section: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  sectionEmpty: {
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  countBadge: {
    minWidth: 28,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    alignItems: 'center',
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
