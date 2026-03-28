import { Link, router } from "expo-router";
import { startTransition, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BikeIllustration } from "../../src/components/bike-illustration";
import {
  Hero,
  LabeledInput,
  PrimaryButton,
  Screen,
  SectionHeader,
  SecondaryButton
} from "../../src/components/ui";
import { useApp } from "../../src/providers/app-provider";
import { colors, spacing } from "../../src/theme/tokens";

export default function SignInScreen() {
  const { signIn, continueWithDemo, firebaseConfigured, usingRemoteApi } = useApp();
  const [email, setEmail] = useState("avery@everides.app");
  const [password, setPassword] = useState("supersecure123");
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setError(null);
      await signIn(email, password);
      startTransition(() => {
        router.replace("/(app)/(tabs)");
      });
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to sign in right now."
      );
    }
  };

  const handleDemo = async () => {
    setError(null);
    await continueWithDemo();
    startTransition(() => {
      router.replace("/(app)/(tabs)");
    });
  };

  return (
    <Screen>
      <SectionHeader title="Sign in" back backHref="/(app)/(tabs)/more" />
      <Hero
        eyebrow="Miami Micromobility"
        title="Rent scooters, bikes, and mopeds the way Turo should feel on two wheels."
        subtitle="Live trip tracking, host messaging, mock payments for now, and a fully sketched host marketplace."
      >
        <BikeIllustration width={120} height={92} />
      </Hero>

      <View style={styles.panel}>
        <LabeledInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholder="you@everides.app"
        />
        <LabeledInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Your password"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          label="Sign in with Firebase"
          onPress={handleSignIn}
        />
        <SecondaryButton label="Keep browsing the catalog" onPress={handleDemo} />
        <Text style={styles.note}>
          {usingRemoteApi
            ? "Remote API mode is enabled. The app will pull live server data when available."
            : "Local mock marketplace mode is enabled. Flip EXPO_PUBLIC_USE_REMOTE_API=true when the API is running."}
        </Text>
        {!firebaseConfigured ? (
          <Text style={styles.note}>
            Firebase config fallback is in use. If sign-in fails, the exact message will appear above this note.
          </Text>
        ) : null}
      </View>

      <Text style={styles.footerText}>
        New to Eve Rides?{" "}
        <Link href="/(auth)/sign-up" style={styles.link}>
          Create an account
        </Link>
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: spacing.md
  },
  error: {
    color: colors.danger,
    fontWeight: "700"
  },
  note: {
    color: colors.inkMuted,
    lineHeight: 20
  },
  footerText: {
    color: colors.inkMuted,
    textAlign: "center"
  },
  link: {
    color: colors.primary,
    fontWeight: "700"
  }
});
