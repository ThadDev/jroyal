"use client";
import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { playNotificationSound } from "@/lib/notificationSound";
import { useToast } from "@/context/ToastContext";

export type AdminEvent = {
  type: "new_reservation" | "new_signup" | "new_order";
  payload: Record<string, string | number>;
  timestamp: string;
};

const EVENT_MESSAGES: Record<AdminEvent["type"], (p: Record<string, string | number>) => string> = {
  new_reservation: (p) => `📅 New reservation from ${p.name ?? "a guest"} for ${p.service ?? ""}`,
  new_signup:      (p) => `👤 New user signed up: ${p.email ?? ""}`,
  new_order:       (p) => `🛒 New order placed by ${p.name ?? "a customer"}`,
};

export function useAdminSocket(onEvent?: (event: AdminEvent) => void) {
  const socketRef = useRef<Socket | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const socket = io("/", { path: "/socket.io", reconnection: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-admin");
    });

    const handleAdminEvent = (event: AdminEvent) => {
      const msg = EVENT_MESSAGES[event.type]?.(event.payload) ?? "New notification";
      playNotificationSound();
      showToast(msg, "info");
      onEvent?.(event);
    };

    socket.on("new_reservation", (payload) =>
      handleAdminEvent({ type: "new_reservation", payload, timestamp: new Date().toISOString() })
    );
    socket.on("new_signup", (payload) =>
      handleAdminEvent({ type: "new_signup", payload, timestamp: new Date().toISOString() })
    );
    socket.on("new_order", (payload) =>
      handleAdminEvent({ type: "new_order", payload, timestamp: new Date().toISOString() })
    );

    return () => {
      socket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return socketRef;
}
