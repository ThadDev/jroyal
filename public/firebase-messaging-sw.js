importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
// We get this from the URL query params or we can hardcode for simplicity if injected
// But since this is a static file, we have to either inject via build or use a generic approach.
// Standard approach is to provide a generic config initialized from an API endpoint,
// but for simplicity in a static file, we'll configure it to expect the config in the URL or
// we will hardcode the sender ID if needed. Wait, we can't use process.env here easily without
// a bundler.
// A common trick is to use new URL(location).searchParams, but let's just use placeholder strings
// The user will replace these with their actual config or use an API route to serve the SW.

// ACTUALLY, we can provide a small script that registers the SW and passes the config via URL.
// Let's use self.firebaseConfig if it exists or fallback.
const firebaseConfig = {
    apiKey: "AIzaSyDHL99l4JZYcG2x2y04XLMNIKZAd3yzIG0",
    authDomain: "m-onyinye-app-3d9a1.firebaseapp.com",
    projectId: "m-onyinye-app-3d9a1",
    storageBucket: "m-onyinye-app-3d9a1.firebasestorage.app",
    messagingSenderId: "277634017682",
    appId: "1:277634017682:web:8fb5b350e0fbc277f4394b",
    measurementId: "G-TY7Z6C9968"
};

// We will initialize firebase.
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log("[firebase-messaging-sw.js] Received background message ", payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: "/favicon.ico", // Update with actual icon path
        data: payload.data, // Contains routing info, etc.
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    // Check if there's a URL in the payload data
    const targetUrl = event.notification.data?.url || "/admin";

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === targetUrl && "focus" in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
