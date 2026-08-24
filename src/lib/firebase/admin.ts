import * as admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY || "";
    const formattedPrivateKey = rawPrivateKey
      .trim()
      .replace(/^"(.*)"$/, "$1")
      .replace(/^'(.*)'$/, "$1")
      .replace(/\\n/g, "\n");

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: formattedPrivateKey,
      }),
    });
  } catch (error: any) {
    console.error("Firebase Admin Initialization Error", error.stack);
  }
}

export const messagingAdmin = admin.messaging();
