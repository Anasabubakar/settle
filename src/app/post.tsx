import type { Metadata } from 'expo-router/server';
import { PAGES } from '@/content/site';
import { useEffect, useRef, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SettleLottie } from '@/components/settle-lottie';
import { SiteFooter } from '@/components/site/site-footer';
import { Fonts, SettleColors } from '@/constants/theme';

const displayFont = Fonts.display ?? Fonts.sans;
const bodyFont = Fonts.body ?? Fonts.sans;
const bodyBoldFont = Fonts.bodyBold ?? Fonts.sans;

type FlowStep = 'upload' | 'scan' | 'review' | 'published';
type SelectedBill = { mimeType?: string; name: string; size?: number; uri: string };

export function generateMetadata(): Metadata {
  return { title: PAGES.post.title, description: PAGES.post.description };
}

export default function PostBillScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 780;
  const [step, setStep] = useState<FlowStep>('upload');
  const [amount, setAmount] = useState('1,240.00');
  const [provider, setProvider] = useState('Northline Property Management');
  const [dueDate, setDueDate] = useState('November 1, 2026');
  const [story, setStory] = useState('I start a new warehouse role next week and need help bridging one month of rent.');
  const [redactAddress, setRedactAddress] = useState(true);
  const [redactAccount, setRedactAccount] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedBill, setSelectedBill] = useState<SelectedBill | null>(null);
  const scanTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (scanTimer.current) clearTimeout(scanTimer.current);
    },
    [],
  );

  const chooseDemoBill = () => {
    setSelectedBill({ mimeType: 'application/pdf', name: 'Northline-rent-statement.pdf', uri: 'demo://rent-bill' });
    setStep('scan');
  };
  const choosePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setSelectedBill({ mimeType: asset.mimeType, name: asset.fileName ?? 'bill-photo.jpg', size: asset.fileSize, uri: asset.uri });
      setStep('scan');
    }
  };
  const chooseFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false, type: ['image/*', 'application/pdf'] });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setSelectedBill({ mimeType: asset.mimeType, name: asset.name, size: asset.size, uri: asset.uri });
      setStep('scan');
    }
  };
  const scanBill = () => {
    setIsScanning(true);
    setStep('scan');
    scanTimer.current = setTimeout(() => {
      scanTimer.current = null;
      setIsScanning(false);
      setStep('review');
    }, 1200);
  };
  const reset = () => {
    if (scanTimer.current) clearTimeout(scanTimer.current);
    scanTimer.current = null;
    setIsScanning(false);
    setSelectedBill(null);
    setStep('upload');
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.shell}>
            <Text style={styles.eyebrow}>REQUEST SUPPORT</Text>
            <Text style={styles.title}>Turn a bill into a clear ask.</Text>
            <Text style={styles.subtitle}>
              Settle reads the essentials, hides private details, and lets you approve every word.
            </Text>

            <View style={styles.stepper}>
              {[
                { id: 1, label: 'Add bill' },
                { id: 2, label: 'Private AI review' },
                { id: 3, label: 'Share' },
              ].map((item, index) => {
                const currentIndex = step === 'upload' ? 0 : step === 'scan' || step === 'review' ? 1 : 2;
                const active = index <= currentIndex;
                return (
                  <View key={item.id} style={styles.stepItem}>
                    <View style={[styles.stepNumber, active && styles.stepNumberActive]}>
                      <Text style={[styles.stepNumberText, active && styles.stepNumberTextActive]}>
                        {active && index < currentIndex ? '✓' : item.id}
                      </Text>
                    </View>
                    <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{item.label}</Text>
                    {index < 2 && <View style={[styles.stepLine, active && styles.stepLineActive]} />}
                  </View>
                );
              })}
            </View>

            {step === 'upload' && (
              <View style={styles.uploadCard}>
                <View style={styles.moneyMotionFrame}>
                  <SettleLottie style={styles.moneyMotion} variant="money" />
                </View>
                <Text style={styles.cardTitle}>Add a photo or PDF</Text>
                <Text style={styles.cardBody}>
                  Use a utility bill, rent statement, medical invoice, or another essential expense.
                </Text>
                <View style={styles.uploadActions}>
                  <Pressable accessibilityRole="button" onPress={() => void choosePhoto()} style={({ pressed }) => [styles.primaryButton, styles.uploadButton, pressed && styles.pressed]}><Text style={styles.primaryButtonText}>Choose photos</Text></Pressable>
                  <Pressable accessibilityRole="button" onPress={() => void chooseFile()} style={({ pressed }) => [styles.fileButton, styles.uploadButton, pressed && styles.pressed]}><Text style={styles.fileButtonText}>Browse files / PDF</Text></Pressable>
                </View>
                <Pressable accessibilityRole="button" onPress={chooseDemoBill} style={styles.demoLink}><Text style={styles.demoLinkText}>Or try a demo bill →</Text></Pressable>
                <Text style={styles.finePrint}>JPG, PNG, HEIC or PDF · up to 15 MB · encrypted before AI review</Text>
              </View>
            )}

            {step === 'scan' && (
              <View style={[styles.workspace, compact && styles.workspaceCompact]}>
                <View style={styles.billPreview}>
                  {selectedBill?.mimeType?.startsWith('image/') ? (
                    <View style={styles.imagePreviewWrap}><Image contentFit="cover" source={{ uri: selectedBill.uri }} style={styles.imagePreview} /><View style={styles.redactionScan}><Text style={styles.redactionScanText}>PRIVATE SCAN</Text></View></View>
                  ) : null}
                  <View style={styles.previewHeader}>
                    <View>
                      <Text style={styles.previewBrand}>NORTHLINE</Text>
                      <Text style={styles.previewSmall}>Property Management</Text>
                    </View>
                    <Text style={styles.previewTag}>{selectedBill?.mimeType?.startsWith('image/') ? 'PHOTO' : 'PDF · 1 PAGE'}</Text>
                  </View>
                  <View style={styles.previewRule} />
                  <Text style={styles.previewLabel}>BALANCE DUE</Text>
                  <Text style={styles.previewAmount}>$1,240.00</Text>
                  <Text style={styles.fileName}>{selectedBill?.name ?? 'Uploaded bill'}</Text>
                  <View style={styles.redactedBlock} />
                  <View style={[styles.redactedBlock, styles.redactedShort]} />
                  <View style={styles.previewDetails}>
                    <View><Text style={styles.previewLabel}>DUE DATE</Text><Text style={styles.previewValue}>NOV 01</Text></View>
                    <View><Text style={styles.previewLabel}>ACCOUNT</Text><Text style={styles.previewValue}>•••• 4821</Text></View>
                  </View>
                </View>
                <View style={styles.scanPanel}>
                  <Text style={styles.panelEyebrow}>PRIVATE AI REVIEW</Text>
                  <Text style={styles.panelTitle}>We only extract what helps.</Text>
                  <Text style={styles.panelText}>
                    Settle looks for the provider, amount, due date, and category. Names, addresses, and account numbers are masked by default.
                  </Text>
                  <View style={styles.securityList}>
                    {['Document encrypted in transit', 'Sensitive fields auto-redacted', 'You approve before publishing'].map((item) => (
                      <View key={item} style={styles.securityRow}>
                        <Text style={styles.check}>✓</Text>
                        <Text style={styles.securityText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    disabled={isScanning}
                    onPress={scanBill}
                    style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
                    {isScanning ? (
                      <View style={styles.loadingRow}>
                        <ActivityIndicator color={SettleColors.paper} size="small" />
                        <Text style={styles.primaryButtonText}>Reading bill…</Text>
                      </View>
                    ) : (
                      <Text style={styles.primaryButtonText}>Scan privately</Text>
                    )}
                  </Pressable>
                  <Pressable onPress={reset} style={styles.textButton}>
                    <Text style={styles.textButtonText}>Choose another</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {step === 'review' && (
              <View style={[styles.workspace, compact && styles.workspaceCompact]}>
                <View style={styles.reviewForm}>
                  <View style={styles.aiBadge}>
                    <Text style={styles.aiBadgeText}>AI extraction complete</Text>
                  </View>
                  <Text style={styles.sectionTitle}>Check the details</Text>
                  <Text style={styles.sectionNote}>Everything remains editable. Nothing is public yet.</Text>
                  <Field label="AMOUNT NEEDED" prefix="$" value={amount} onChangeText={setAmount} />
                  <Field label="BILL PROVIDER" value={provider} onChangeText={setProvider} />
                  <Field label="DUE DATE" value={dueDate} onChangeText={setDueDate} />
                  <Text style={styles.fieldLabel}>YOUR CONTEXT</Text>
                  <TextInput
                    accessibilityLabel="Your context"
                    multiline
                    onChangeText={setStory}
                    style={[styles.input, styles.storyInput]}
                    textAlignVertical="top"
                    value={story}
                  />
                </View>
                <View style={styles.redactionPanel}>
                  <Text style={styles.panelEyebrow}>PRIVACY CHECK</Text>
                  <Text style={styles.panelTitle}>Hidden from your post</Text>
                  <Text style={styles.panelText}>The original bill stays private and is revealed only as needed for secure settlement.</Text>
                  <PrivacyToggle label="Home address" onValueChange={setRedactAddress} value={redactAddress} />
                  <PrivacyToggle label="Account number" onValueChange={setRedactAccount} value={redactAccount} />
                  <View style={styles.safePreview}>
                    <Text style={styles.safePreviewLabel}>PUBLIC PREVIEW</Text>
                    <Text style={styles.safePreviewTitle}>One month of rent</Text>
                    <Text style={styles.safePreviewText}>Northline Property Management · due Nov 1</Text>
                    <Text style={styles.safePreviewAmount}>${amount}</Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setStep('published')}
                    style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
                    <Text style={styles.primaryButtonText}>Publish request</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {step === 'published' && (
              <View style={styles.successCard}>
                <SettleLottie loop={false} style={styles.publishMotion} variant="success" />
                <Text style={styles.successTitle}>Your request is ready.</Text>
                <Text style={styles.successText}>
                  It is now in the discovery deck with your private details protected. You stay in control of every offer.
                </Text>
                <View style={styles.publishedSummary}>
                  <Text style={styles.publishedLabel}>RENT · DUE NOV 1</Text>
                  <Text style={styles.publishedAmount}>${amount}</Text>
                  <Text style={styles.publishedProvider}>{provider}</Text>
                  <View style={styles.stellarRoute}><Text style={styles.stellarRouteLabel}>SETTLEMENT RAIL</Text><Text style={styles.stellarRouteValue}>USDC · STELLAR</Text></View>
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={reset}
                  style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
                  <Text style={styles.secondaryButtonText}>Post another bill</Text>
                </Pressable>
              </View>
            )}
          </View>
          <SiteFooter webOnly />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

type FieldProps = { label: string; onChangeText: (text: string) => void; prefix?: string; value: string };

function Field({ label, onChangeText, prefix, value }: FieldProps) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        {prefix && <Text style={styles.inputPrefix}>{prefix}</Text>}
        <TextInput
          accessibilityLabel={label}
          onChangeText={onChangeText}
          style={[styles.input, prefix ? styles.inputWithPrefix : undefined]}
          value={value}
        />
      </View>
    </View>
  );
}

type PrivacyToggleProps = { label: string; onValueChange: (value: boolean) => void; value: boolean };

function PrivacyToggle({ label, onValueChange, value }: PrivacyToggleProps) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleCopy}>
        <Text style={styles.toggleTitle}>{label}</Text>
        <Text style={styles.toggleCaption}>{value ? 'Redacted' : 'Visible'}</Text>
      </View>
      <Switch
        accessibilityLabel={`Hide ${label}`}
        onValueChange={onValueChange}
        thumbColor={SettleColors.paper}
        trackColor={{ false: SettleColors.line, true: SettleColors.acid }}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SettleColors.ivory },
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 44, paddingBottom: 140 },
  shell: { width: '100%', maxWidth: 1120, alignSelf: 'center' },
  eyebrow: { alignSelf: 'flex-start', backgroundColor: SettleColors.yellow, borderColor: SettleColors.ink, borderRadius: 8, borderWidth: 2, color: SettleColors.ink, fontFamily: displayFont, fontSize: 10, letterSpacing: 1.1, overflow: 'hidden', paddingHorizontal: 12, paddingVertical: 6 },
  title: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 52, lineHeight: 54, marginTop: 18, maxWidth: 780, letterSpacing: -1.4, textTransform: 'uppercase' },
  subtitle: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 16, lineHeight: 24, marginTop: 14, maxWidth: 680 },
  stepper: { flexDirection: 'row', marginTop: 38, maxWidth: 760 },
  stepItem: { alignItems: 'center', flexDirection: 'row', flex: 1 },
  stepNumber: { alignItems: 'center', backgroundColor: SettleColors.paper, borderColor: SettleColors.line, borderRadius: 9, borderWidth: 2, height: 34, justifyContent: 'center', width: 34 },
  stepNumberActive: { backgroundColor: SettleColors.cobalt, borderColor: SettleColors.ink },
  stepNumberText: { color: SettleColors.muted, fontFamily: displayFont, fontSize: 10 },
  stepNumberTextActive: { color: SettleColors.paper },
  stepLabel: { color: SettleColors.muted, fontFamily: displayFont, fontSize: 9, letterSpacing: 0.45, marginLeft: 8, textTransform: 'uppercase' },
  stepLabelActive: { color: SettleColors.ink },
  stepLine: { backgroundColor: SettleColors.line, flex: 1, height: 2, marginHorizontal: 9 },
  stepLineActive: { backgroundColor: SettleColors.cobalt },
  uploadCard: { alignItems: 'center', backgroundColor: SettleColors.paper, borderColor: SettleColors.ink, borderRadius: 14, borderWidth: 3, marginTop: 38, paddingHorizontal: 24, paddingVertical: 58, shadowColor: SettleColors.cobalt, shadowOffset: { width: 10, height: 10 }, shadowOpacity: 1, shadowRadius: 0 },
  documentIcon: { alignItems: 'center', backgroundColor: SettleColors.orange, borderColor: SettleColors.ink, borderRadius: 12, borderWidth: 3, height: 68, justifyContent: 'center', width: 68, shadowColor: SettleColors.ink, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 },
  moneyMotionFrame: { alignItems: 'center', backgroundColor: SettleColors.lavender, borderColor: SettleColors.ink, borderRadius: 14, borderWidth: 3, height: 142, justifyContent: 'center', width: 180, shadowColor: SettleColors.purple, shadowOffset: { width: 8, height: 8 }, shadowOpacity: 1, shadowRadius: 0, overflow: 'hidden' },
  moneyMotion: { width: 170, height: 132 },
  documentFold: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 30 },
  cardTitle: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 30, letterSpacing: -0.45, marginTop: 26, textTransform: 'uppercase' },
  cardBody: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 14, lineHeight: 22, marginTop: 10, maxWidth: 500, textAlign: 'center' },
  primaryButton: { alignItems: 'center', backgroundColor: SettleColors.acid, borderColor: SettleColors.ink, borderRadius: 10, borderWidth: 3, justifyContent: 'center', marginTop: 26, minHeight: 52, paddingHorizontal: 26, paddingVertical: 14, shadowColor: SettleColors.ink, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 },
  primaryButtonText: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 12, letterSpacing: 0.45, textTransform: 'uppercase' },
  uploadActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 24 },
  uploadButton: { marginTop: 0 },
  fileButton: { alignItems: 'center', backgroundColor: SettleColors.yellow, borderColor: SettleColors.ink, borderRadius: 10, borderWidth: 3, justifyContent: 'center', minHeight: 52, paddingHorizontal: 26, paddingVertical: 14, shadowColor: SettleColors.ink, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 },
  fileButtonText: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 12, letterSpacing: 0.45, textTransform: 'uppercase' },
  demoLink: { marginTop: 20, padding: 6 },
  demoLinkText: { color: SettleColors.purple, fontFamily: bodyBoldFont, fontSize: 12, textDecorationLine: 'underline' },
  secondaryButton: { alignItems: 'center', backgroundColor: SettleColors.mint, borderColor: SettleColors.ink, borderRadius: 12, borderWidth: 3, marginTop: 24, paddingHorizontal: 24, paddingVertical: 14, shadowColor: SettleColors.ink, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 },
  secondaryButtonText: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 12, textTransform: 'uppercase' },
  finePrint: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 11, marginTop: 14 },
  pressed: { transform: [{ translateX: 3 }, { translateY: 3 }], shadowOffset: { width: 0, height: 0 } },
  workspace: { alignItems: 'stretch', flexDirection: 'row', gap: 24, marginTop: 38 },
  workspaceCompact: { flexDirection: 'column' },
  billPreview: { backgroundColor: SettleColors.paper, borderColor: SettleColors.line, borderRadius: 14, borderWidth: 3, flex: 1, minHeight: 410, padding: 28, shadowColor: SettleColors.ink, shadowOffset: { width: 6, height: 6 }, shadowOpacity: 1, shadowRadius: 0 },
  imagePreviewWrap: { borderColor: SettleColors.ink, borderRadius: 10, borderWidth: 2, height: 150, marginBottom: 22, overflow: 'hidden', position: 'relative' },
  imagePreview: { height: '100%', width: '100%' },
  redactionScan: { backgroundColor: SettleColors.acid, borderColor: SettleColors.ink, borderRadius: 6, borderWidth: 2, bottom: 9, paddingHorizontal: 8, paddingVertical: 5, position: 'absolute', right: 9 },
  redactionScanText: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 7, letterSpacing: 0.8 },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  previewBrand: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 17, letterSpacing: 1.1 },
  previewSmall: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 11, marginTop: 3 },
  previewTag: { backgroundColor: SettleColors.yellow, borderColor: SettleColors.ink, borderRadius: 6, borderWidth: 2, color: SettleColors.ink, fontFamily: displayFont, fontSize: 8, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 5 },
  previewRule: { backgroundColor: SettleColors.line, height: 3, marginVertical: 30 },
  previewLabel: { color: SettleColors.muted, fontFamily: displayFont, fontSize: 8, letterSpacing: 1.15 },
  previewAmount: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 43, letterSpacing: -1, marginTop: 8 },
  fileName: { color: SettleColors.purple, fontFamily: bodyBoldFont, fontSize: 10, marginTop: 8 },
  redactedBlock: { backgroundColor: SettleColors.ink, borderRadius: 3, height: 11, marginTop: 30, opacity: 0.88, width: '72%' },
  redactedShort: { marginTop: 9, width: '46%' },
  previewDetails: { flexDirection: 'row', gap: 60, marginTop: 64 },
  previewValue: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 12, marginTop: 7 },
  scanPanel: { backgroundColor: SettleColors.cobalt, borderRadius: 14, borderWidth: 3, borderColor: SettleColors.ink, flex: 1, padding: 30, shadowColor: SettleColors.ink, shadowOffset: { width: 8, height: 8 }, shadowOpacity: 1, shadowRadius: 0 },
  panelEyebrow: { color: SettleColors.acid, fontFamily: displayFont, fontSize: 9, letterSpacing: 1.45 },
  panelTitle: { color: SettleColors.paper, fontFamily: displayFont, fontSize: 29, letterSpacing: -0.4, lineHeight: 33, marginTop: 14, textTransform: 'uppercase' },
  panelText: { color: SettleColors.cobaltSoft, fontFamily: bodyFont, fontSize: 14, lineHeight: 22, marginTop: 13 },
  securityList: { gap: 12, marginTop: 24 },
  securityRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  check: { color: SettleColors.acid, fontFamily: displayFont, fontSize: 15 },
  securityText: { color: SettleColors.paper, fontFamily: bodyFont, fontSize: 13 },
  loadingRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  textButton: { alignItems: 'center', marginTop: 14, paddingVertical: 8 },
  textButtonText: { color: SettleColors.paper, fontFamily: displayFont, fontSize: 11, textDecorationLine: 'underline', textTransform: 'uppercase' },
  reviewForm: { backgroundColor: SettleColors.paper, borderColor: SettleColors.line, borderRadius: 14, borderWidth: 3, flex: 1.2, gap: 16, padding: 28, shadowColor: SettleColors.ink, shadowOffset: { width: 6, height: 6 }, shadowOpacity: 1, shadowRadius: 0 },
  aiBadge: { alignSelf: 'flex-start', backgroundColor: SettleColors.yellow, borderColor: SettleColors.ink, borderRadius: 8, borderWidth: 2, paddingHorizontal: 12, paddingVertical: 7 },
  aiBadgeText: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 9, letterSpacing: 0.75, textTransform: 'uppercase' },
  sectionTitle: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 29, letterSpacing: -0.4, marginTop: 4, textTransform: 'uppercase' },
  sectionNote: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 13, lineHeight: 19, marginBottom: 4 },
  fieldLabel: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 8, letterSpacing: 1.3, marginBottom: 7 },
  inputWrap: { position: 'relative' },
  input: { backgroundColor: SettleColors.ivory, borderColor: SettleColors.line, borderRadius: 8, borderWidth: 2, color: SettleColors.ink, fontFamily: bodyBoldFont, fontSize: 14, minHeight: 50, paddingHorizontal: 14, paddingVertical: 12 },
  inputWithPrefix: { paddingLeft: 30 },
  inputPrefix: { color: SettleColors.cobalt, fontFamily: displayFont, fontSize: 16, left: 14, position: 'absolute', top: 14, zIndex: 1 },
  storyInput: { minHeight: 106 },
  redactionPanel: { backgroundColor: SettleColors.cobalt, borderRadius: 14, borderWidth: 3, borderColor: SettleColors.ink, flex: 0.8, padding: 28, shadowColor: SettleColors.ink, shadowOffset: { width: 8, height: 8 }, shadowOpacity: 1, shadowRadius: 0 },
  toggleRow: { alignItems: 'center', borderBottomColor: SettleColors.cobaltSoft, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16 },
  toggleCopy: { flex: 1 },
  toggleTitle: { color: SettleColors.paper, fontFamily: displayFont, fontSize: 13, textTransform: 'uppercase' },
  toggleCaption: { color: SettleColors.cobaltSoft, fontFamily: bodyFont, fontSize: 11, marginTop: 3 },
  safePreview: { backgroundColor: SettleColors.paper, borderColor: SettleColors.ink, borderRadius: 12, borderWidth: 3, marginTop: 20, padding: 18 },
  safePreviewLabel: { color: SettleColors.cobalt, fontFamily: displayFont, fontSize: 8, letterSpacing: 1.2 },
  safePreviewTitle: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 19, marginTop: 11, textTransform: 'uppercase' },
  safePreviewText: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 11, lineHeight: 17, marginTop: 4 },
  safePreviewAmount: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 25, marginTop: 18 },
  successCard: { alignItems: 'center', backgroundColor: SettleColors.paper, borderColor: SettleColors.line, borderRadius: 14, borderWidth: 3, marginTop: 38, paddingHorizontal: 26, paddingVertical: 54, shadowColor: SettleColors.cobalt, shadowOffset: { width: 10, height: 10 }, shadowOpacity: 1, shadowRadius: 0 },
  successMark: { alignItems: 'center', backgroundColor: SettleColors.pink, borderColor: SettleColors.ink, borderRadius: 12, borderWidth: 3, height: 72, justifyContent: 'center', width: 72, shadowColor: SettleColors.ink, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 },
  successCheck: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 31 },
  publishMotion: { height: 120, width: 120 },
  successTitle: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 33, letterSpacing: -0.55, marginTop: 24, textTransform: 'uppercase' },
  successText: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 14, lineHeight: 22, marginTop: 11, maxWidth: 540, textAlign: 'center' },
  publishedSummary: { backgroundColor: SettleColors.cobaltSoft, borderColor: SettleColors.ink, borderRadius: 12, borderWidth: 3, marginTop: 28, maxWidth: 440, padding: 22, width: '100%' },
  publishedLabel: { color: SettleColors.cobalt, fontFamily: displayFont, fontSize: 8, letterSpacing: 1.2 },
  publishedAmount: { color: SettleColors.ink, fontFamily: displayFont, fontSize: 34, letterSpacing: -0.55, marginTop: 10 },
  publishedProvider: { color: SettleColors.muted, fontFamily: bodyFont, fontSize: 12, marginTop: 4 },
  stellarRoute: { alignItems: 'center', backgroundColor: SettleColors.ink, borderRadius: 8, marginTop: 17, paddingHorizontal: 14, paddingVertical: 10 },
  stellarRouteLabel: { color: SettleColors.orange, fontFamily: displayFont, fontSize: 7, letterSpacing: 1 },
  stellarRouteValue: { color: SettleColors.acid, fontFamily: displayFont, fontSize: 11, marginTop: 4 },
});
