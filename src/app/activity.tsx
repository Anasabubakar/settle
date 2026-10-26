import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts, SettleColors } from '@/constants/theme';

const displayFont = Fonts.display ?? Fonts.sans;
const bodyFont = Fonts.body ?? Fonts.sans;
const bodyBoldFont = Fonts.bodyBold ?? Fonts.sans;

type ActivityFilter = 'All' | 'Settled' | 'In progress';

const contributions = [
  {
    id: 'rent',
    person: 'Maya R.',
    label: 'One month of rent',
    date: 'Today, 9:42 AM',
    amount: '$1,240',
    status: 'Settled',
    note: 'A safe month to reset and look for steady work.',
    progress: 1,
  },
  {
    id: 'dental',
    person: 'Darius K.',
    label: 'Emergency dental care',
    date: 'Oct 23',
    amount: '$680',
    status: 'Settled',
    note: 'Treatment completed. Darius sent a private thank-you.',
    progress: 1,
  },
  {
    id: 'power',
    person: 'Nia & family',
    label: 'Keep the power on',
    date: 'Oct 20',
    amount: '$320 of $510',
    status: 'In progress',
    note: 'Two other people are helping close the remaining balance.',
    progress: 0.63,
  },
];

export default function ActivityScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 760;
  const [filter, setFilter] = useState<ActivityFilter>('All');
  const visibleContributions = useMemo(
    () =>
      filter === 'All'
        ? contributions
        : contributions.filter((contribution) => contribution.status === filter),
    [filter],
  );

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.shell}>
            <View style={[styles.headingRow, compact && styles.headingRowCompact]}>
              <View style={styles.headingCopy}>
                <Text style={styles.eyebrow}>YOUR IMPACT</Text>
                <Text style={styles.title}>Good travels further.</Text>
                <Text style={styles.subtitle}>
                  A clear record of the breathing room you have helped create.
                </Text>
              </View>
              <View style={styles.seasonBadge}>
                <View style={styles.seasonDot} />
                <Text style={styles.seasonText}>Autumn giving</Text>
              </View>
            </View>

            <View style={[styles.impactGrid, compact && styles.stack]}>
              <View style={[styles.totalCard, styles.flexCard]}>
                <Text style={styles.cardLabel}>TOTAL SETTLED</Text>
                <Text style={styles.totalAmount}>$4,860</Text>
                <Text style={styles.totalCaption}>across 9 essential bills</Text>
                <View style={styles.cobaltRule} />
                <Text style={styles.quote}>
                  “Security is often one ordinary bill, handled at the right moment.”
                </Text>
              </View>

              <View style={[styles.flexCard, styles.metricColumn]}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>13</Text>
                  <View style={styles.metricCopy}>
                    <Text style={styles.metricTitle}>people supported</Text>
                    <Text style={styles.metricNote}>including 4 children</Text>
                  </View>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>21</Text>
                  <View style={styles.metricCopy}>
                    <Text style={styles.metricTitle}>days of calm</Text>
                    <Text style={styles.metricNote}>estimated from funded essentials</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={[styles.sectionTop, compact && styles.sectionTopCompact]}>
              <View>
                <Text style={styles.sectionTitle}>Recent contributions</Text>
                <Text style={styles.sectionSubtitle}>Receipts stay private. Impact stays visible.</Text>
              </View>
              <View style={styles.filters}>
                {(['All', 'Settled', 'In progress'] as const).map((item) => {
                  const selected = item === filter;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      key={item}
                      onPress={() => setFilter(item)}
                      style={({ pressed }) => [
                        styles.filterChip,
                        selected && styles.filterChipSelected,
                        pressed && styles.pressed,
                      ]}>
                      <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.list}>
              {visibleContributions.map((item) => (
                <View key={item.id} style={styles.contributionCard}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.person.charAt(0)}</Text>
                  </View>
                  <View style={styles.contributionBody}>
                    <View style={[styles.contributionTop, compact && styles.contributionTopCompact]}>
                      <View style={styles.contributionHeading}>
                        <Text style={styles.contributionTitle}>{item.label}</Text>
                        <Text style={styles.personText}>{item.person} · {item.date}</Text>
                      </View>
                      <View style={styles.amountBlock}>
                        <Text style={styles.amount}>{item.amount}</Text>
                        <Text
                          style={[
                            styles.status,
                            item.status === 'In progress' && styles.statusProgress,
                          ]}>
                          {item.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.note}>{item.note}</Text>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${item.progress * 100}%` }]} />
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.privacyNote}>
              <Text style={styles.privacyMark}>S</Text>
              <View style={styles.privacyCopy}>
                <Text style={styles.privacyTitle}>Quiet by design</Text>
                <Text style={styles.privacyText}>
                  Names are shortened and sensitive bill details remain visible only to the people involved.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SettleColors.ivory },
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 44, paddingBottom: 140 },
  shell: { width: '100%', maxWidth: 1120, alignSelf: 'center' },
  headingRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 },
  headingRowCompact: { alignItems: 'flex-start', flexDirection: 'column' },
  headingCopy: { maxWidth: 700 },
  eyebrow: { alignSelf: 'flex-start', backgroundColor: SettleColors.yellow, borderColor: SettleColors.ink, borderRadius: 8, borderWidth: 2, color: SettleColors.ink, fontFamily: displayFont, fontSize: 10, letterSpacing: 1.1, overflow: 'hidden', paddingHorizontal: 12, paddingVertical: 6 },
  title: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 52, lineHeight: 54, marginTop: 18, letterSpacing: -1.4, textTransform: 'uppercase' },
  subtitle: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 16, lineHeight: 24, marginTop: 14, maxWidth: 600 },
  seasonBadge: { alignItems: 'center', backgroundColor: SettleColors.cobaltSoft, borderColor: SettleColors.line, borderRadius: 12, borderWidth: 3, flexDirection: 'row', gap: 9, paddingHorizontal: 16, paddingVertical: 12, shadowColor: SettleColors.ink, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 },
  seasonDot: { backgroundColor: SettleColors.cobalt, borderColor: SettleColors.ink, borderRadius: 4, borderWidth: 1, height: 10, width: 10 },
  seasonText: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 11, letterSpacing: 0.45, textTransform: 'uppercase' },
  impactGrid: { flexDirection: 'row', gap: 22, marginTop: 38 },
  stack: { flexDirection: 'column' },
  flexCard: { flex: 1 },
  totalCard: { backgroundColor: SettleColors.cobalt, borderRadius: 14, borderWidth: 3, borderColor: SettleColors.ink, minHeight: 286, padding: 30, shadowColor: SettleColors.ink, shadowOffset: { width: 8, height: 8 }, shadowOpacity: 1, shadowRadius: 0 },
  cardLabel: { color: SettleColors.mint, fontFamily: displayFont, fontSize: 10, letterSpacing: 1.5 },
  totalAmount: { color: SettleColors.paper, fontFamily: displayFont, fontSize: 60, letterSpacing: -1.8, marginTop: 18 },
  totalCaption: { color: SettleColors.cobaltSoft, fontFamily: bodyBoldFont, fontSize: 13, marginTop: 2 },
  cobaltRule: { backgroundColor: SettleColors.mint, borderColor: SettleColors.ink, borderWidth: 1, height: 8, marginTop: 32, width: 56 },
  quote: { color: SettleColors.paper, fontFamily: bodyBoldFont, fontSize: 17, lineHeight: 24, marginTop: 14, maxWidth: 430 },
  metricColumn: { gap: 14 },
  metricCard: { alignItems: 'center', backgroundColor: SettleColors.paper, borderColor: SettleColors.line, borderRadius: 12, borderWidth: 3, flex: 1, flexDirection: 'row', gap: 20, minHeight: 136, paddingHorizontal: 24, paddingVertical: 20, shadowColor: SettleColors.ink, shadowOffset: { width: 5, height: 5 }, shadowOpacity: 1, shadowRadius: 0 },
  metricValue: { color: SettleColors.cobalt, fontFamily: displayFont, fontSize: 46, letterSpacing: -1, minWidth: 62 },
  metricCopy: { flex: 1 },
  metricTitle: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 15, textTransform: 'uppercase' },
  metricNote: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 12, lineHeight: 18, marginTop: 5 },
  sectionTop: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between', marginTop: 58, gap: 18 },
  sectionTopCompact: { alignItems: 'flex-start', flexDirection: 'column' },
  sectionTitle: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 29, letterSpacing: -0.45, textTransform: 'uppercase' },
  sectionSubtitle: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 13, marginTop: 7 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: { backgroundColor: SettleColors.paper, borderColor: SettleColors.line, borderRadius: 10, borderWidth: 2, paddingHorizontal: 15, paddingVertical: 10 },
  filterChipSelected: { backgroundColor: SettleColors.mint, borderColor: SettleColors.ink, shadowColor: SettleColors.ink, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0 },
  filterText: { color: SettleColors.muted, fontFamily: displayFont, fontSize: 10, letterSpacing: 0.45, textTransform: 'uppercase' },
  filterTextSelected: { color: SettleColors.ink },
  pressed: { opacity: 0.78, transform: [{ translateY: 2 }] },
  list: { gap: 16, marginTop: 24 },
  contributionCard: { backgroundColor: SettleColors.paper, borderColor: SettleColors.line, borderRadius: 12, borderWidth: 3, flexDirection: 'row', gap: 16, padding: 21, shadowColor: SettleColors.ink, shadowOffset: { width: 5, height: 5 }, shadowOpacity: 1, shadowRadius: 0 },
  avatar: { alignItems: 'center', backgroundColor: SettleColors.mint, borderColor: SettleColors.ink, borderRadius: 10, borderWidth: 2, height: 46, justifyContent: 'center', width: 46 },
  avatarText: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 17 },
  contributionBody: { flex: 1, minWidth: 0 },
  contributionTop: { flexDirection: 'row', gap: 16, justifyContent: 'space-between' },
  contributionTopCompact: { flexDirection: 'column', gap: 10 },
  contributionHeading: { flex: 1 },
  contributionTitle: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 16, textTransform: 'uppercase' },
  personText: { color: SettleColors.muted, fontFamily: bodyBoldFont, fontSize: 11, marginTop: 5, textTransform: 'uppercase' },
  amountBlock: { alignItems: 'flex-end' },
  amount: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 16 },
  status: { color: SettleColors.emeraldDark, fontFamily: displayFont, fontSize: 9, letterSpacing: 0.65, marginTop: 4, textTransform: 'uppercase' },
  statusProgress: { color: SettleColors.cobalt },
  note: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 13, lineHeight: 19, marginTop: 14 },
  progressTrack: { backgroundColor: SettleColors.cobaltSoft, borderColor: SettleColors.ink, borderRadius: 4, borderWidth: 2, height: 10, marginTop: 16, overflow: 'hidden' },
  progressFill: { backgroundColor: SettleColors.mint, height: '100%' },
  privacyNote: { backgroundColor: SettleColors.mint, borderColor: SettleColors.ink, borderRadius: 12, borderWidth: 3, flexDirection: 'row', gap: 14, marginTop: 30, padding: 20, shadowColor: SettleColors.ink, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 },
  privacyMark: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 25 },
  privacyCopy: { flex: 1 },
  privacyTitle: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 13, textTransform: 'uppercase' },
  privacyText: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 12, lineHeight: 18, marginTop: 4 },
});
