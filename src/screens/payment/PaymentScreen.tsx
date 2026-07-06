// src/screens/payment/PaymentScreen.tsx
//
// Two payment paths, chosen automatically via isPayHereConfigured():
//
// - Not configured (default, out of the box): shows a card-entry screen
//   styled like a real gateway checkout, then simulates processing and
//   always succeeds — no server, no ngrok, nothing to set up. This is what
//   runs unless you deliberately configure src/config/env.ts.
// - Configured: loads PayHere's real sandbox checkout in a WebView, backed
//   by the server in server/ (see server/README.md).
//
// Either way, both paths end by dispatching confirmPayment() against the
// app's own mock paymentSlice before creating the property, so
// propertyStore.create's payment gate behaves identically regardless of
// which path ran.

import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Icon, ActivityIndicator } from 'react-native-paper';
import { WebView, WebViewNavigation } from 'react-native-webview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PropertyStackParamList } from '@/navigation/PropertyNavigator';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { startCheckout, confirmPayment, resetPayment } from '@/redux/payment/paymentSlice';
import { createProperty } from '@/redux/property/propertySlice';
import { payhereApi } from '@/services/api/payhereApi';
import { isPayHereConfigured } from '@/config/env';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import { colors } from '@/theme/colors';
import { fonts, type } from '@/theme/typography';
import { moderateScale } from '@/utils/responsive';
import { formatCurrency } from '@/utils/currency';
import { LISTING_FEE_LKR } from '@/types/payment.types';

type Props = NativeStackScreenProps<PropertyStackParamList, 'Payment'>;

type Stage =
  | 'summary'
  | 'cardEntry'
  | 'launching'
  | 'checkout'
  | 'processing'
  | 'confirming'
  | 'success'
  | 'error';

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 20; // ~40 seconds

// --- tiny formatters for the mock card form, purely cosmetic ---
function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}
function formatCvv(value: string): string {
  return value.replace(/\D/g, '').slice(0, 3);
}

interface CardFormErrors {
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  cardholderName?: string;
}

export default function PaymentScreen({ route, navigation }: Props) {
  const { formInput } = route.params;
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [stage, setStage] = useState<Stage>('summary');
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const orderIdRef = useRef<string | null>(null);
  const hasHandledRedirect = useRef(false);

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState(user?.name ?? '');
  const [cardErrors, setCardErrors] = useState<CardFormErrors>({});

  const finishWithProperty = async (orderId: string) => {
    const createResult = await dispatch(createProperty({ input: formInput, paymentOrderId: orderId }));
    if (createProperty.fulfilled.match(createResult)) {
      setStage('success');
    } else {
      throw new Error('Payment succeeded but the listing could not be created');
    }
  };

  // ---- Path A: no PayHere server configured — card-entry mock, always succeeds ----
  const validateCardForm = (): boolean => {
    const errors: CardFormErrors = {};
    if (cardNumber.replace(/\s/g, '').length < 12) errors.cardNumber = 'Enter a card number';
    if (expiry.length < 5) errors.expiry = 'Enter expiry as MM/YY';
    if (cvv.length < 3) errors.cvv = 'Enter the 3-digit CVV';
    if (!cardholderName.trim()) errors.cardholderName = "Enter the cardholder's name";
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const runSimulatedPayment = async () => {
    if (!validateCardForm()) return;
    setStage('processing');
    try {
      const mockOrderResult = await dispatch(startCheckout());
      if (!startCheckout.fulfilled.match(mockOrderResult)) {
        throw new Error('Could not start checkout');
      }
      const orderId = mockOrderResult.payload.orderId;

      // Sandbox-style processing delay so it feels like a real gateway
      // round-trip rather than an instant local flip.
      await new Promise((resolve) => setTimeout(resolve, 1600));

      const confirmResult = await dispatch(confirmPayment(orderId));
      if (confirmPayment.rejected.match(confirmResult)) {
        throw new Error(confirmResult.payload ?? 'Payment could not be confirmed');
      }

      await finishWithProperty(orderId);
    } catch (err) {
      setErrorMessage((err as Error).message);
      setStage('error');
    }
  };

  // ---- Path B: real PayHere sandbox via WebView ----
  const pollForConfirmation = useCallback(
    async (orderId: string, attempt = 0) => {
      try {
        const result = await payhereApi.getOrderStatus(orderId);

        if (result.status === 'paid') {
          const mockConfirm = await dispatch(confirmPayment(orderId));
          if (!confirmPayment.fulfilled.match(mockConfirm)) {
            throw new Error('Payment verified but could not finalize locally');
          }
          await finishWithProperty(orderId);
          return;
        }

        if (result.status === 'failed') {
          throw new Error('PayHere reported this payment as failed or cancelled.');
        }

        if (attempt >= MAX_POLL_ATTEMPTS) {
          throw new Error(
            "We haven't received confirmation from PayHere yet. If you completed payment, check back shortly — otherwise try again."
          );
        }
        setTimeout(() => pollForConfirmation(orderId, attempt + 1), POLL_INTERVAL_MS);
      } catch (err) {
        setErrorMessage((err as Error).message);
        setStage('error');
      }
    },
    [dispatch, formInput]
  );

  const runRealPayHereCheckout = async () => {
    setStage('launching');
    try {
      const mockOrderResult = await dispatch(startCheckout());
      if (!startCheckout.fulfilled.match(mockOrderResult)) {
        throw new Error('Could not start checkout');
      }
      const orderId = mockOrderResult.payload.orderId;
      orderIdRef.current = orderId;

      const [firstName, ...rest] = (user?.name ?? 'EstateGo User').split(' ');
      const session = await payhereApi.createSession(orderId, LISTING_FEE_LKR, {
        firstName,
        lastName: rest.join(' ') || 'User',
        email: user?.email,
      });

      hasHandledRedirect.current = false;
      setCheckoutUrl(session.checkoutUrl);
      setStage('checkout');
    } catch (err) {
      setErrorMessage((err as Error).message);
      setStage('error');
    }
  };

  const handleContinueFromSummary = () => {
    setErrorMessage(null);
    if (isPayHereConfigured()) {
      runRealPayHereCheckout();
    } else {
      setStage('cardEntry');
    }
  };

  const handleNavigationChange = (navState: WebViewNavigation) => {
    if (hasHandledRedirect.current || !orderIdRef.current) return;

    if (navState.url.includes('/api/payhere/return')) {
      hasHandledRedirect.current = true;
      setStage('confirming');
      pollForConfirmation(orderIdRef.current);
    } else if (navState.url.includes('/api/payhere/cancel')) {
      hasHandledRedirect.current = true;
      dispatch(resetPayment());
      navigation.goBack();
    }
  };

  const handleDone = () => {
    navigation.popToTop();
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      {stage !== 'checkout' && (
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.brandIconCircle}>
              <Icon source="credit-card-outline" size={18} color={colors.textInverse} />
            </View>
            <Text style={styles.brandText}>PayHere Checkout</Text>
          </View>
        </View>
      )}

      {stage === 'checkout' && checkoutUrl && (
        <WebView
          source={{ uri: checkoutUrl }}
          onNavigationStateChange={handleNavigationChange}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
          style={styles.webview}
        />
      )}

      {stage !== 'checkout' && (
        <View style={styles.content}>
          {stage === 'summary' && (
            <>
              <Text style={styles.title}>Listing Fee</Text>
              <Text style={styles.subtitle}>
                A one-time fee is required to publish your property so it's visible to everyone.
              </Text>

              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Item</Text>
                  <Text style={styles.summaryValue}>Property Listing</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Property</Text>
                  <Text style={styles.summaryValue} numberOfLines={1}>
                    {formInput.title || 'Untitled listing'}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryTotalLabel}>Total</Text>
                  <Text style={styles.summaryTotalValue}>{formatCurrency(LISTING_FEE_LKR)}</Text>
                </View>
              </View>

              <Button
                label={`Pay ${formatCurrency(LISTING_FEE_LKR)} with PayHere`}
                onPress={handleContinueFromSummary}
              />
              <Text style={styles.disclaimer}>
                {isPayHereConfigured()
                  ? "You'll be taken to PayHere's real sandbox checkout."
                  : 'Sandbox checkout — enter any card details to continue.'}
              </Text>
            </>
          )}

          {stage === 'cardEntry' && (
            <>
              <View style={styles.cardFormHeader}>
                <Icon source="shield-check-outline" size={16} color={colors.success} />
                <Text style={styles.cardFormHeaderText}>Secure sandbox checkout</Text>
              </View>

              <View style={styles.amountPill}>
                <Text style={styles.amountPillLabel}>Amount to pay</Text>
                <Text style={styles.amountPillValue}>{formatCurrency(LISTING_FEE_LKR)}</Text>
              </View>

              <Input
                label="Card Number"
                value={cardNumber}
                onChangeText={(v) => setCardNumber(formatCardNumber(v))}
                keyboardType="numeric"
                icon="credit-card-outline"
                error={cardErrors.cardNumber}
              />
              <View style={styles.row}>
                <View style={styles.rowItem}>
                  <Input
                    label="Expiry (MM/YY)"
                    value={expiry}
                    onChangeText={(v) => setExpiry(formatExpiry(v))}
                    keyboardType="numeric"
                    error={cardErrors.expiry}
                  />
                </View>
                <View style={styles.rowItem}>
                  <Input
                    label="CVV"
                    value={cvv}
                    onChangeText={(v) => setCvv(formatCvv(v))}
                    keyboardType="numeric"
                    secureTextEntry
                    error={cardErrors.cvv}
                  />
                </View>
              </View>
              <Input
                label="Cardholder Name"
                value={cardholderName}
                onChangeText={setCardholderName}
                autoCapitalize="words"
                error={cardErrors.cardholderName}
              />

              <Button label={`Pay ${formatCurrency(LISTING_FEE_LKR)}`} onPress={runSimulatedPayment} style={styles.payButton} />
              <TouchableOpacity onPress={() => setStage('summary')}>
                <Text style={styles.backLink}>Back</Text>
              </TouchableOpacity>
            </>
          )}

          {stage === 'launching' && (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.processingText}>Opening secure checkout...</Text>
            </View>
          )}

          {stage === 'processing' && (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.processingText}>Processing your payment...</Text>
              <Text style={styles.disclaimer}>Please don't close this screen.</Text>
            </View>
          )}

          {stage === 'confirming' && (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.processingText}>Confirming your payment...</Text>
              <Text style={styles.disclaimer}>
                Waiting for PayHere to confirm this transaction. This is usually instant.
              </Text>
            </View>
          )}

          {stage === 'success' && (
            <View style={styles.centerState}>
              <View style={styles.successIconCircle}>
                <Icon source="check" size={32} color={colors.textInverse} />
              </View>
              <Text style={styles.title}>Payment Successful</Text>
              <Text style={styles.subtitle}>
                Your listing has been published and is now visible to everyone.
              </Text>
              <Button label="Done" onPress={handleDone} />
            </View>
          )}

          {stage === 'error' && (
            <View style={styles.centerState}>
              <View style={styles.errorIconCircle}>
                <Icon source="close" size={32} color={colors.textInverse} />
              </View>
              <Text style={styles.title}>Payment Failed</Text>
              <Text style={styles.subtitle}>{errorMessage ?? 'Something went wrong. Please try again.'}</Text>
              <Button label="Try Again" onPress={() => setStage('summary')} style={styles.retryButton} />
              <Button label="Cancel" mode="text" onPress={() => navigation.goBack()} />
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingVertical: moderateScale(16),
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: {
    fontFamily: fonts.displaySemiBold,
    fontSize: moderateScale(type.h3),
    color: colors.text,
  },
  webview: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: moderateScale(20),
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: moderateScale(type.h1),
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: moderateScale(type.caption),
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: moderateScale(19),
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: moderateScale(16),
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontFamily: fonts.body,
    fontSize: moderateScale(type.caption),
    color: colors.textMuted,
  },
  summaryValue: {
    fontFamily: fonts.bodyMedium,
    fontSize: moderateScale(type.caption),
    color: colors.text,
    maxWidth: '60%',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  summaryTotalLabel: {
    fontFamily: fonts.displaySemiBold,
    fontSize: moderateScale(type.h3),
    color: colors.text,
  },
  summaryTotalValue: {
    fontFamily: fonts.displayBold,
    fontSize: moderateScale(type.h3),
    color: colors.primary,
  },
  disclaimer: {
    fontFamily: fonts.body,
    fontSize: moderateScale(type.micro),
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
  retryButton: {
    marginBottom: 8,
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    fontFamily: fonts.bodyMedium,
    fontSize: moderateScale(type.body),
    color: colors.text,
    marginTop: 16,
    marginBottom: 4,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  // card entry stage
  cardFormHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  cardFormHeaderText: {
    fontFamily: fonts.bodyMedium,
    fontSize: moderateScale(type.micro),
    color: colors.success,
  },
  amountPill: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: moderateScale(14),
    alignItems: 'center',
    marginBottom: 20,
  },
  amountPillLabel: {
    fontFamily: fonts.body,
    fontSize: moderateScale(type.micro),
    color: colors.textMuted,
    marginBottom: 4,
  },
  amountPillValue: {
    fontFamily: fonts.displayBold,
    fontSize: moderateScale(type.h2),
    color: colors.primary,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  payButton: {
    marginTop: 8,
  },
  backLink: {
    fontFamily: fonts.bodySemiBold,
    fontSize: moderateScale(type.caption),
    color: colors.primary,
    textAlign: 'center',
    marginTop: 4,
  },
});
