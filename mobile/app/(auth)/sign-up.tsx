import { Link, router } from "expo-router";
import { startTransition, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  Hero,
  LabeledInput,
  PrimaryButton,
  Screen,
  SectionHeader
} from "../../src/components/ui";
import { useApp } from "../../src/providers/app-provider";
import { colors, spacing } from "../../src/theme/tokens";

export default function SignUpScreen() {
  const { signUp, firebaseConfigured } = useApp();
  const [firstName, setFirstName] = useState("Avery");
  const [lastName, setLastName] = useState("Morgan");
  const [email, setEmail] = useState("avery@everides.app");
  const [password, setPassword] = useState("supersecure123");
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    try {
      setError(null);
      await signUp(firstName, lastName, email, password);
      startTransition(() => {
        router.replace("/(app)/(tabs)");
      });
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to create your account."
      );
    }
  };

  return (
    <Screen>
      <SectionHeader title="Create account" back backHref="/(app)/(tabs)/more" />
      <Hero
        eyebrow="Hosts and Riders"
        title="Create the account that powers booking, hosting, and live rental tracking."
        subtitle="Firebase handles auth. Marketplace inventory and payments stay safely mocked until you switch providers on."
      />

      <View style={styles.panel}>
        <LabeledInput
          label="First name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <LabeledInput
          label="Last name"
          value={lastName}
          onChangeText={setLastName}
        />
        <LabeledInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <LabeledInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          label="Create Firebase account"
          onPress={handleSignUp}
        />
        {!firebaseConfigured ? (
          <Text style={styles.footerText}>
            Firebase config fallback is in use. If account creation fails, the exact message will appear above.
          </Text>
        ) : null}
      </View>

      <Text style={styles.footerText}>
        Already have an account?{" "}
        <Link href="/(auth)/sign-in" style={styles.link}>
          Sign in
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
  footerText: {
    color: colors.inkMuted,
    textAlign: "center"
  },
  link: {
    color: colors.primary,
    fontWeight: "700"
  }
});
