import type { Metadata } from 'expo-router/server';
import { PAGES } from '@/content/site';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SiteFooter } from '@/components/site/site-footer';
import { MoreLinks } from '@/components/site/more-links';
import { Fonts, SettleColors } from '@/constants/theme';

const displayFont = Fonts.display ?? Fonts.sans;
const bodyFont = Fonts.body ?? Fonts.sans;
const bodyBoldFont = Fonts.bodyBold ?? Fonts.sans;

const preferenceOptions = ['Housing', 'Medical', 'Utilities', 'Education', 'Family care'];

export function generateMetadata(): Metadata {
  return { title: PAGES.profile.title, description: PAGES.profile.description };
}

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 780;
  const [role, setRole] = useState<'Supporter' | 'Requester'>('Supporter');
  const [quietGiving, setQuietGiving] = useState(true);
  const [impactUpdates, setImpactUpdates] = useState(true);
  const [preferences, setPreferences] = useState(['Housing', 'Medical', 'Utilities']);

  const togglePreference = (preference: string) => {
    setPreferences((current) =>
      current.includes(preference)
        ? current.filter((item) => item !== preference)
        : [...current, preference],
    );
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.shell}>
            <View style={[styles.header, compact && styles.headerCompact]}>
              <View style={styles.identityRow}>
                <View style={styles.avatar}><Text style={styles.avatarText}>AO</Text></View>
                <View style={styles.identityCopy}>
                  <Text style={styles.eyebrow}>YOUR PROFILE</Text>
                  <Text style={styles.name}>Amina Okafor</Text>
                  <Text style={styles.location}>Lagos · Member since May 2026</Text>
                </View>
              </View>
              <View style={styles.memberBadge}>
                <Text style={styles.memberBadgeMark}>S</Text>
                <View>
                  <Text style={styles.memberBadgeLabel}>SETTLE MEMBER</Text>
                  <Text style={styles.memberBadgeText}>Identity confirmed</Text>
                </View>
              </View>
            </View>

            <View style={styles.trustCard}>
              <View style={styles.trustScore}>
                <Text style={styles.trustScoreValue}>92</Text>
                <Text style={styles.trustScoreUnit}>/ 100</Text>
              </View>
              <View style={styles.trustCopy}>
                <Text style={styles.trustTitle}>Excellent trust standing</Text>
                <Text style={styles.trustText}>Built through identity checks, respectful offers, and completed settlements.</Text>
                <View style={styles.trustTrack}><View style={styles.trustFill} /></View>
              </View>
              {!compact && <Text style={styles.trustShield}>✓</Text>}
            </View>

            <View style={[styles.grid, compact && styles.gridCompact]}>
              <View style={styles.mainColumn}>
                <SectionCard title="How you use Settle" subtitle="Switch roles whenever your circumstances change.">
                  <View style={styles.rolePicker}>
                    {(['Supporter', 'Requester'] as const).map((item) => {
                      const selected = role === item;
                      return (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityState={{ selected }}
                          key={item}
                          onPress={() => setRole(item)}
                          style={({ pressed }) => [
                            styles.roleOption,
                            selected && styles.roleOptionSelected,
                            pressed && styles.pressed,
                          ]}>
                          <Text style={[styles.roleOptionTitle, selected && styles.roleOptionTitleSelected]}>{item}</Text>
                          <Text style={[styles.roleOptionText, selected && styles.roleOptionTextSelected]}>
                            {item === 'Supporter' ? 'Discover and settle verified bills' : 'Ask for help with an essential bill'}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </SectionCard>

                <SectionCard title="Giving preferences" subtitle="Shape your discovery deck. You can still see every category.">
                  <View style={styles.chipWrap}>
                    {preferenceOptions.map((preference) => {
                      const selected = preferences.includes(preference);
                      return (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityState={{ selected }}
                          key={preference}
                          onPress={() => togglePreference(preference)}
                          style={({ pressed }) => [
                            styles.preferenceChip,
                            selected && styles.preferenceChipSelected,
                            pressed && styles.pressed,
                          ]}>
                          <Text style={[styles.preferenceText, selected && styles.preferenceTextSelected]}>
                            {selected ? '✓ ' : ''}{preference}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <View style={styles.rangeRow}>
                    <View>
                      <Text style={styles.settingTitle}>Comfortable contribution</Text>
                      <Text style={styles.settingText}>Used only to order recommendations</Text>
                    </View>
                    <Text style={styles.rangeValue}>$100 to $1,500</Text>
                  </View>
                </SectionCard>

                <SectionCard title="Privacy & updates" subtitle="Simple controls for how Settle communicates.">
                  <SettingToggle
                    caption="Your public activity shows Anonymous supporter."
                    label="Give quietly"
                    onValueChange={setQuietGiving}
                    value={quietGiving}
                  />
                  <View style={styles.settingDivider} />
                  <SettingToggle
                    caption="A short note when a contribution changes someone’s week."
                    label="Impact updates"
                    onValueChange={setImpactUpdates}
                    value={impactUpdates}
                  />
                </SectionCard>
              </View>

              <View style={styles.sideColumn}>
                <View style={styles.insightCard}>
                  <Text style={styles.insightEyebrow}>THIS SEASON</Text>
                  <Text style={styles.insightAmount}>$4,860</Text>
                  <Text style={styles.insightText}>settled across 9 bills</Text>
                  <View style={styles.insightRule} />
                  <View style={styles.insightRow}><Text style={styles.insightKey}>People supported</Text><Text style={styles.insightValue}>13</Text></View>
                  <View style={styles.insightRow}><Text style={styles.insightKey}>Offer acceptance</Text><Text style={styles.insightValue}>100%</Text></View>
                  <View style={styles.insightRow}><Text style={styles.insightKey}>Avg. response</Text><Text style={styles.insightValue}>2h</Text></View>
                </View>

                <View style={styles.verificationCard}>
                  <Text style={styles.sectionTitle}>Trust signals</Text>
                  <Text style={styles.sectionSubtitle}>Visible only as simple badges.</Text>
                  <VerificationRow label="Identity" detail="Confirmed" />
                  <VerificationRow label="Payment method" detail="Verified" />
                  <VerificationRow label="Community conduct" detail="Excellent" />
                </View>

                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.supportButton, pressed && styles.pressed]}>
                  <Text style={styles.supportButtonText}>Account & safety</Text>
                  <Text style={styles.supportArrow}>›</Text>
                </Pressable>
              </View>
            </View>

            <MoreLinks />

            <Text style={styles.footerNote}>Your generosity is yours. This prototype collects no giving data.</Text>
          </View>
          <SiteFooter webOnly />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

type SectionCardProps = { children: React.ReactNode; subtitle: string; title: string };

function SectionCard({ children, subtitle, title }: SectionCardProps) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

type SettingToggleProps = { caption: string; label: string; onValueChange: (value: boolean) => void; value: boolean };

function SettingToggle({ caption, label, onValueChange, value }: SettingToggleProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingCopy}>
        <Text style={styles.settingTitle}>{label}</Text>
        <Text style={styles.settingText}>{caption}</Text>
      </View>
      <Switch
        onValueChange={onValueChange}
        thumbColor={SettleColors.paper}
        trackColor={{ false: SettleColors.line, true: SettleColors.acid }}
        value={value}
      />
    </View>
  );
}

function VerificationRow({ detail, label }: { detail: string; label: string }) {
  return (
    <View style={styles.verificationRow}>
      <View style={styles.verificationMark}><Text style={styles.verificationCheck}>✓</Text></View>
      <View style={styles.verificationCopy}>
        <Text style={styles.verificationLabel}>{label}</Text>
        <Text style={styles.verificationDetail}>{detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SettleColors.ivory },
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 44, paddingBottom: 140 },
  shell: { alignSelf: 'center', maxWidth: 1120, width: '100%' },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: 24 },
  headerCompact: { alignItems: 'flex-start', flexDirection: 'column' },
  identityRow: { alignItems: 'center', flexDirection: 'row', gap: 18 },
  avatar: { alignItems: 'center', backgroundColor: SettleColors.orange, borderColor: SettleColors.ink, borderRadius: 14, borderWidth: 3, height: 72, justifyContent: 'center', width: 72, shadowColor: SettleColors.ink, shadowOffset: { width: 5, height: 5 }, shadowOpacity: 1, shadowRadius: 0 },
  avatarText: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 21 },
  identityCopy: { flexShrink: 1 },
  eyebrow: { alignSelf: 'flex-start', backgroundColor: SettleColors.yellow, borderColor: SettleColors.ink, borderRadius: 7, borderWidth: 2, color: SettleColors.ink, fontFamily: displayFont, fontSize: 9, letterSpacing: 1.15, overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 5 },
  name: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 39, letterSpacing: -0.65, marginTop: 8, textTransform: 'uppercase' },
  location: { color: SettleColors.muted, fontFamily: bodyBoldFont, fontSize: 12, marginTop: 5 },
  memberBadge: { alignItems: 'center', backgroundColor: SettleColors.cobaltSoft, borderColor: SettleColors.line, borderRadius: 12, borderWidth: 3, flexDirection: 'row', gap: 11, paddingHorizontal: 17, paddingVertical: 13, shadowColor: SettleColors.ink, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 },
  memberBadgeMark: { color: SettleColors.cobalt, fontFamily: displayFont, fontSize: 25 },
  memberBadgeLabel: { color: SettleColors.muted, fontFamily: displayFont, fontSize: 8, letterSpacing: 1.2 },
  memberBadgeText: { color: SettleColors.ink, fontFamily: bodyBoldFont, fontSize: 12, marginTop: 2 },
  trustCard: { alignItems: 'center', backgroundColor: SettleColors.cobalt, borderRadius: 14, borderWidth: 3, borderColor: SettleColors.ink, flexDirection: 'row', gap: 22, marginTop: 34, padding: 26, shadowColor: SettleColors.ink, shadowOffset: { width: 8, height: 8 }, shadowOpacity: 1, shadowRadius: 0 },
  trustScore: { alignItems: 'baseline', flexDirection: 'row' },
  trustScoreValue: { color: SettleColors.paper, fontFamily: displayFont, fontSize: 46, letterSpacing: -0.9 },
  trustScoreUnit: { color: SettleColors.cobaltSoft, fontFamily: bodyFont, fontSize: 12 },
  trustCopy: { flex: 1 },
  trustTitle: { color: SettleColors.paper, fontFamily: displayFont, fontSize: 15, textTransform: 'uppercase' },
  trustText: { color: SettleColors.cobaltSoft, fontFamily: bodyFont, fontSize: 12, lineHeight: 18, marginTop: 4 },
  trustTrack: { backgroundColor: SettleColors.ink, borderColor: SettleColors.ink, borderRadius: 5, borderWidth: 1, height: 8, marginTop: 14, overflow: 'hidden' },
  trustFill: { backgroundColor: SettleColors.acid, height: '100%', width: '92%' },
  trustShield: { color: SettleColors.acid, fontFamily: displayFont, fontSize: 28, paddingHorizontal: 8 },
  grid: { alignItems: 'flex-start', flexDirection: 'row', gap: 22, marginTop: 24 },
  gridCompact: { flexDirection: 'column' },
  mainColumn: { flex: 1.35, gap: 18, minWidth: 0 },
  sideColumn: { flex: 0.75, gap: 18, minWidth: 0 },
  sectionCard: { backgroundColor: SettleColors.paper, borderColor: SettleColors.line, borderRadius: 12, borderWidth: 3, padding: 24, shadowColor: SettleColors.ink, shadowOffset: { width: 5, height: 5 }, shadowOpacity: 1, shadowRadius: 0 },
  sectionTitle: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 22, letterSpacing: -0.25, textTransform: 'uppercase' },
  sectionSubtitle: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 12, lineHeight: 18, marginTop: 6 },
  sectionContent: { marginTop: 18 },
  rolePicker: { flexDirection: 'row', gap: 10 },
  roleOption: { backgroundColor: SettleColors.ivory, borderColor: SettleColors.line, borderRadius: 10, borderWidth: 2, flex: 1, padding: 16 },
  roleOptionSelected: { backgroundColor: SettleColors.cobalt, borderColor: SettleColors.ink },
  roleOptionTitle: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 12, textTransform: 'uppercase' },
  roleOptionTitleSelected: { color: SettleColors.paper },
  roleOptionText: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 11, lineHeight: 16, marginTop: 5 },
  roleOptionTextSelected: { color: SettleColors.cobaltSoft },
  pressed: { transform: [{ translateX: 2 }, { translateY: 2 }], shadowOffset: { width: 0, height: 0 } },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  preferenceChip: { backgroundColor: SettleColors.ivory, borderColor: SettleColors.line, borderRadius: 9, borderWidth: 2, paddingHorizontal: 13, paddingVertical: 9 },
  preferenceChipSelected: { backgroundColor: SettleColors.yellow, borderColor: SettleColors.ink, shadowColor: SettleColors.ink, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0 },
  preferenceText: { color: SettleColors.muted, fontFamily: displayFont, fontSize: 10, textTransform: 'uppercase' },
  preferenceTextSelected: { color: SettleColors.ink },
  rangeRow: { alignItems: 'center', borderTopColor: SettleColors.line, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, paddingTop: 18, gap: 14 },
  rangeValue: { color: SettleColors.cobalt, fontFamily: displayFont, fontSize: 12 },
  settingRow: { alignItems: 'center', flexDirection: 'row', gap: 16 },
  settingCopy: { flex: 1 },
  settingTitle: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 12, textTransform: 'uppercase' },
  settingText: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 11, lineHeight: 16, marginTop: 3 },
  settingDivider: { backgroundColor: SettleColors.line, height: 1, marginVertical: 17 },
  insightCard: { backgroundColor: SettleColors.acid, borderColor: SettleColors.ink, borderRadius: 12, borderWidth: 3, padding: 24, shadowColor: SettleColors.ink, shadowOffset: { width: 7, height: 7 }, shadowOpacity: 1, shadowRadius: 0 },
  insightEyebrow: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 9, letterSpacing: 1.45 },
  insightAmount: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 42, letterSpacing: -0.85, marginTop: 14 },
  insightText: { color: SettleColors.ink, fontFamily: bodyBoldFont, fontSize: 12, marginTop: 3 },
  insightRule: { backgroundColor: SettleColors.ink, height: 2, marginVertical: 20 },
  insightRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 11 },
  insightKey: { color: SettleColors.ink, fontFamily: bodyBoldFont, fontSize: 11 },
  insightValue: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 11 },
  verificationCard: { backgroundColor: SettleColors.paper, borderColor: SettleColors.line, borderRadius: 12, borderWidth: 3, padding: 24, shadowColor: SettleColors.ink, shadowOffset: { width: 5, height: 5 }, shadowOpacity: 1, shadowRadius: 0 },
  verificationRow: { alignItems: 'center', flexDirection: 'row', gap: 12, marginTop: 17 },
  verificationMark: { alignItems: 'center', backgroundColor: SettleColors.aqua, borderColor: SettleColors.ink, borderRadius: 7, borderWidth: 2, height: 31, justifyContent: 'center', width: 31 },
  verificationCheck: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 12 },
  verificationCopy: { flex: 1 },
  verificationLabel: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 11, textTransform: 'uppercase' },
  verificationDetail: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 10, marginTop: 2 },
  supportButton: { alignItems: 'center', backgroundColor: SettleColors.acid, borderColor: SettleColors.ink, borderRadius: 12, borderWidth: 3, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 16, shadowColor: SettleColors.ink, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 },
  supportButtonText: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 11, textTransform: 'uppercase' },
  supportArrow: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 25 },
  footerNote: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 11, marginTop: 32, textAlign: 'center' },
});
