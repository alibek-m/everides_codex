import { nanoid } from "nanoid";
import type { NotificationItem } from "@everides/shared";

export const buildNotification = (
  type: NotificationItem["type"],
  title: string,
  body: string
): NotificationItem => ({
  id: nanoid(),
  type,
  title,
  body,
  createdAt: new Date().toISOString(),
  isRead: false
});
