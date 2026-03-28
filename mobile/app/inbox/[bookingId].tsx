import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LabeledInput, PrimaryButton, Screen, SectionHeader } from "../../src/components/ui";
import { useApp } from "../../src/providers/app-provider";
import { colors, radius, spacing } from "../../src/theme/tokens";
import { formatDateTime } from "../../src/utils/format";

export default function ChatThreadScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { bookings, getMessagesForBooking, sendMessage, profile } = useApp();
  const [content, setContent] = useState("");
  const booking = bookings.find((item) => item.id === bookingId);
  const messages = getMessagesForBooking(bookingId);

  if (!booking || !profile) {
    return null;
  }

  const otherUser = booking.riderId === profile.id ? booking.host : booking.rider;

  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <SectionHeader
          title={`${otherUser.firstName} • ${booking.vehicle.title}`}
          back
          backHref="/(app)/(tabs)/inbox"
        />
        <ScrollView contentContainerStyle={styles.stack}>
          {messages.map((message) => {
            const mine = message.senderId === profile.id;
            return (
              <View
                key={message.id}
                style={[styles.bubble, mine ? styles.mine : styles.theirs]}
              >
                <Text style={[styles.message, mine && styles.mineText]}>{message.content}</Text>
                <Text style={[styles.timestamp, mine && styles.mineText]}>
                  {formatDateTime(message.createdAt)}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.composer}>
          <LabeledInput
            label="Message"
            value={content}
            onChangeText={setContent}
            placeholder="Ask about pickup, battery, or route tips"
            multiline
          />
          <PrimaryButton
            label="Send"
            onPress={async () => {
              if (!content.trim()) {
                return;
              }

              await sendMessage({
                bookingId,
                receiverId: otherUser.id,
                content
              });
              setContent("");
            }}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.background
  },
  stack: {
    gap: spacing.sm,
    paddingBottom: spacing.md
  },
  bubble: {
    maxWidth: "82%",
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 6
  },
  mine: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary
  },
  theirs: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface
  },
  message: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 20
  },
  mineText: {
    color: colors.surface
  },
  timestamp: {
    color: colors.inkMuted,
    fontSize: 11,
    fontWeight: "700"
  },
  composer: {
    gap: spacing.md
  }
});
