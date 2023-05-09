# Deployment

## Deployment to production checklist

Check the following items before deploying to production:
1. Check if [the indexes of the dev Firestore](https://console.firebase.google.com/u/0/project/bedtime-writer/firestore/indexes) match [the prod Firestore](https://console.firebase.google.com/u/0/project/bedtime-writer-prod/firestore/indexes).
2. Check if [the rules of the dev Firestore](https://console.firebase.google.com/u/0/project/bedtime-writer/firestore/rules) match [the prod Firestore](https://console.firebase.google.com/u/0/project/bedtime-writer-prod/firestore/rules). Also check the [local rules](../firestore.rules).

## Firebase rules

The `*.rules` files in the main folder are only used for the Firebase emulators. To deploy them on
the production server, use the
[Firebase console](https://console.firebase.google.com/project/bedtime-writer/firestore/rules).

## Secrets

We use Google Cloud Secret Manager to store secrets such as the Open AI API key. See
[the corresponding documentation](https://firebase.google.com/docs/functions/config-env#secret-manager).

## Deploy the backend

Run `npm run deploy_functions` in the `functions` folder. Reminder: it will use the `.env` file,
not `.env.local`.

## Deploy the Web frontend

**This frontend should only be used for testing campaigns.**

1. Deploy the rules and the backend if needed (see above).
2. Edit `bedtime-writer/.env` if needed (you most certainly want to disable the `DEBUG_` keys and
   set `BACKEND=remote`).
3. Run `flutter build web --web-renderer canvaskit` (using this specific Web renderer is important
   for the Lottie animations). If the Firebase emulators are running, visit <http://localhost:5000>
   to preview what you are about to deploy.
4. Deploy with `npm run deploy_hosting` in the `functions` folder. This deploys the app with
   Firebase Hosting. You can retrieve the link in
   [the console](https://console.firebase.google.com/project/bedtime-writer/hosting/sites). Be aware
   that the link expires after 7 days by default (this can be changed in the console).

**Never publish anything to the "real", live channel.** Our goal is not to publish to the Web, we
only use it as a convenient way to share a test version of our app. Publishing to the live channel
is dangerous, as it has a very easy to guess URL and no expiration time, so we cannot control its
access.

If you ever publish to the live channel, delete everything inside the `bedtime-writer/build/web`
folder, create a blank `index.html` file in it, and run `firebase deploy --only hosting` from the
`functions` folder. This should erase everything you uploaded.
