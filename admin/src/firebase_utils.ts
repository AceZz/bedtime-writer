import "dotenv/config";
import { applicationDefault, initializeApp } from "firebase-admin/app";

/**
 * Initialize the Firebase application, configuring the emulators if needed.
 */
export function initFirebase(forceEmulators = false) {
  configureFirebaseEmulators(forceEmulators);
  checkFirebaseCredentialsEnv();
  initializeApp({
    credential: applicationDefault(),
  });
}

/**
 * Configure the Firebase emulators if USE_FIREBASE_EMULATORS is set to true.
 *
 * This function must be called before `initializeApp()` of `firebase-admin`.
 */
function configureFirebaseEmulators(forceEmulators: boolean) {
  if (process.env.USE_FIREBASE_EMULATORS?.toLowerCase() === "true") {
    console.log("Use Firebase emulators");

    process.env["FIREBASE_AUTH_EMULATOR_HOST"] = "localhost:9099";
    process.env["FIREBASE_DATABASE_EMULATOR_HOST"] = "localhost:9000";
    process.env["FIRESTORE_EMULATOR_HOST"] = "localhost:8080";
    process.env["FIREBASE_STORAGE_EMULATOR_HOST"] = "localhost:9199";
  } else if (forceEmulators) {
    throw new Error(`Emulators are requested. Please set
"USE_FIREBASE_EMULATORS=true" in your .env file.`);
  }
}

/**
 * Check that the environment variable giving the path to the Google service
 * account configuration file is set.
 */
function checkFirebaseCredentialsEnv() {
  const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (credentials === undefined) {
    throw Error(`GOOGLE_APPLICATION_CREDENTIALS not set

Download a service account file from https://console.firebase.google.com/u/0/project/_/settings/serviceaccounts/adminsdk
and set the environment variable:
  * on Linux or macOS: export GOOGLE_APPLICATION_CREDENTIALS="..."
  * on Windows PowerShell: $env:GOOGLE_APPLICATION_CREDENTIALS="..."

Where ... is the path to the file (usually service-account.json or service-account-dev.json).

See https://firebase.google.com/docs/admin/setup#initialize_the_sdk_in_non-google_environments for more details.
`);
  }
}
