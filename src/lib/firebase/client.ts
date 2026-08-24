import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const messaging = (): Messaging | null => {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    // Only attempt FCM Web Push initialization if explicitly enabled in .env.local
    if (process.env.NEXT_PUBLIC_ENABLE_FCM !== "true") {
      return null;
    }
    try {
      return getMessaging(app);
    } catch (error) {
      console.warn("[FCM] Firebase messaging initialization warning:", error);
      return null;
    }
  }
  return null;
};

// Helper to validate if a string is a valid 65-byte Base64URL Web Push VAPID public key
function isValidVapidKey(key: string | undefined): boolean {
  if (!key || typeof key !== "string") return false;
  const cleanKey = key.trim().replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
  if (cleanKey.length < 80 || cleanKey.length > 90 || cleanKey.startsWith("G-")) return false;

  try {
    const base64 = cleanKey.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
    const rawData = atob(padded);
    return rawData.length === 65;
  } catch {
    return false;
  }
}

export const requestForToken = async (): Promise<string | null> => {
  try {
    const msg = messaging();
    if (!msg) return null;

    const rawVapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    const vapidKey = rawVapidKey?.trim().replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");

    // Validate VAPID key format before passing to browser PushManager to prevent InvalidAccessError
    if (!isValidVapidKey(vapidKey)) {
      console.warn(
        "[FCM Push Notification Notice]: NEXT_PUBLIC_FIREBASE_VAPID_KEY in .env.local is missing or invalid.\n" +
        "To enable web push, go to Firebase Console → Project Settings → Cloud Messaging → Web Push certificates\n" +
        "and copy your VAPID key pair into .env.local."
      );
      return null;
    }

    // Pass current active service worker registration (e.g. /sw-admin.js or /firebase-messaging-sw.js)
    let serviceWorkerRegistration: ServiceWorkerRegistration | undefined;
    if ("serviceWorker" in navigator) {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          serviceWorkerRegistration = reg;
        }
      } catch (swErr) {
        console.warn("[FCM] Service worker registration lookup warning:", swErr);
      }
    }

    // Suppress internal Firebase SDK console.error logs & unhandled promise rejections
    // to prevent Next.js dev error overlay from interrupting development.
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const firstArg = args[0]?.toString() || "";
      const fullStr = args.map(a => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ");
      if (
        firstArg.includes("messaging/token-subscribe-failed") ||
        fullStr.includes("token-subscribe-failed") ||
        fullStr.includes("Request is missing required authentication credential") ||
        fullStr.includes("InvalidAccessError") ||
        fullStr.includes("applicationServerKey") ||
        fullStr.includes("PushManager")
      ) {
        console.warn("[FCM Warning - Push Notifications Skipped]:", ...args);
        return;
      }
      originalConsoleError.apply(console, args);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = String(event.reason?.message || event.reason || "");
      if (
        reason.includes("token-subscribe-failed") ||
        reason.includes("messaging/") ||
        reason.includes("authentication credential") ||
        reason.includes("InvalidAccessError") ||
        reason.includes("applicationServerKey") ||
        reason.includes("PushManager")
      ) {
        event.preventDefault();
        console.warn("[FCM Push Notification Notice]: FCM token subscription requires valid VAPID credentials.");
      }
    };

    const handleWindowError = (event: ErrorEvent) => {
      const msg = String(event.message || event.error || "");
      if (
        msg.includes("InvalidAccessError") ||
        msg.includes("applicationServerKey") ||
        msg.includes("PushManager") ||
        msg.includes("subscribe")
      ) {
        event.preventDefault();
        event.stopPropagation();
        console.warn("[FCM Push Notification Notice]: Browser push manager rejected invalid applicationServerKey.");
        return true;
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("unhandledrejection", handleUnhandledRejection);
      window.addEventListener("error", handleWindowError, true);
    }

    try {
      const currentToken = await getToken(msg, {
        vapidKey,
        serviceWorkerRegistration,
      });

      console.error = originalConsoleError;
      if (typeof window !== "undefined") {
        window.removeEventListener("unhandledrejection", handleUnhandledRejection);
        window.removeEventListener("error", handleWindowError, true);
      }

      if (currentToken) {
        return currentToken;
      } else {
        console.log("No registration token available.");
        return null;
      }
    } catch (err) {
      console.error = originalConsoleError;
      if (typeof window !== "undefined") {
        window.removeEventListener("unhandledrejection", handleUnhandledRejection);
        window.removeEventListener("error", handleWindowError, true);
      }
      console.warn("[FCM Push Notification Notice]: FCM push token unavailable (VAPID key mismatched or FCM V1 API unconfigured).");
      return null;
    }
  } catch (err) {
    console.warn("[FCM] General error during token request:", err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    const msg = messaging();
    if (!msg) return;
    onMessage(msg, (payload) => {
      resolve(payload);
    });
  });
