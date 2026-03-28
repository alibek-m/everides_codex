import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BikeIllustration } from "../../../src/components/bike-illustration";
import { Card, Chip, EmptyState, Screen, SectionHeader } from "../../../src/components/ui";
import { useApp } from "../../../src/providers/app-provider";
import { colors, radius, spacing } from "../../../src/theme/tokens";
import { formatDateTime } from "../../../src/utils/format";

export default function InboxScreen() {
  const { getThreads, notifications } = useApp();
  const [tab, setTab] = useState<"Messages" | "Notifications">("Messages");
  const threads = getThreads();

  return (
    <Screen>
      <SectionHeader title="Inbox" />
      <View style={styles.tabRow}>
        <Chip label="Messages" active={tab === "Messages"} onPress={() => setTab("Messages")} />
        <Chip
          label="Notifications"
          active={tab === "Notifications"}
          onPress={() => setTab("Notifications")}
        />
      </View>

      {tab === "Messages" ? (
        threads.length === 0 ? (
          <EmptyState
            art={<BikeIllustration />}
            title="No messages yet"
            description="Conversations appear after you request or host a booking."
          />
        ) : (
          <View style={styles.stack}>
            {threads.map((thread) => (
              <Link
                key={thread.bookingId}
                href={{
                  pathname: "/inbox/[bookingId]",
                  params: {
                    bookingId: thread.bookingId
                  }
                }}
                asChild
              >
                <Pressable style={styles.thread}>
                  <Text style={styles.threadTitle}>{thread.otherUser.firstName}</Text>
                  <Text style={styles.threadMeta}>{thread.vehicle.title}</Text>
                  <Text numberOfLines={2} style={styles.threadPreview}>
                    {thread.lastMessage.content}
                  </Text>
                  <Text style={styles.threadMeta}>{formatDateTime(thread.lastMessage.createdAt)}</Text>
                  {thread.unreadCount > 0 ? (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{thread.unreadCount} new</Text>
                    </View>
                  ) : null}
                </Pressable>
              </Link>
            ))}
          </View>
        )
      ) : (
        <View style={styles.stack}>
          {notifications.map((notification) => (
            <Card key={notification.id} muted={notification.isRead}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.threadPreview}>{notification.body}</Text>
              <Text style={styles.threadMeta}>{formatDateTime(notification.createdAt)}</Text>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  stack: {
    gap: spacing.md
  },
  thread: {
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: 6
  },
  threadTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "800"
  },
  threadMeta: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: "600"
  },
  threadPreview: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 20
  },
  unreadBadge: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  unreadText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "800"
  },
  notificationTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800"
  }
});
