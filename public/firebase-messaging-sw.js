importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

const firebaseConfig = {
    apiKey: "AIzaSyC78hUITRPBKFBYPzYzh3Jr-N2dxS6q3iA",
    authDomain: "jroyal-app.firebaseapp.com",
    projectId: "jroyal-app",
    storageBucket: "jroyal-app.firebasestorage.app",
    messagingSenderId: "880761037356",
    appId: "1:880761037356:web:50a2274d38c02c2d1be789"
};

// Initialize firebase in SW
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log("[firebase-messaging-sw.js] Received background message:", payload);
    const notificationTitle = payload.notification?.title || payload.data?.title || "Jroyal Alert";
    const notificationBody = payload.notification?.body || payload.data?.body || "";
    
    const notificationOptions = {
        body: notificationBody,
        icon: "/icons/jroyal.png",
        badge: "/icons/icon-192x192.png",
        vibrate: [200, 100, 200, 100, 200],
        tag: payload.data?.id || `jroyal-bg-${Date.now()}`,
        renotify: true,
        data: {
            url: payload.data?.url || "/admin",
            ...payload.data,
        },
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const targetUrl = event.notification.data?.url || "/admin";

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(targetUrl) && "focus" in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
