# Administration tools

The `admin` folder contains a Node.js project with tools to administrate `bedtime-writer`.

## Setup

These instructions will use `bedtime-writer-dev` as an example. Change the project accordingly if
necessary.

### Node setup

Go to the `admin` folder and run `npm install --include=dev`.

### Service account file

Go to <https://console.firebase.google.com/u/0/project/bedtime-writer-dev/settings/serviceaccounts/adminsdk>
and click on "Generate new private key". You will download a JSON file that contains a secret key
to connect to Firebase services.

**Keep this file secure.** Anybody with this file has basically all the rights on our project. Do
not send it over the Internet (in particular, do not commit it). If you think there is any chance
that someone was given access to it, **revoke your access immediately**. To do so, go to
<https://console.cloud.google.com/iam-admin/serviceaccounts?authuser=0&project=bedtime-writer-dev&hl=en>,
select the `firebase-adminsdk` account, go to Keys and remove your key (the key ID is in the JSON
file).

Rename the file to `service-account.json` or `service-account-dev.json` and put it in the `admin`
folder.

## Run

Run `firebase use bedtime-writer-dev`.

Then, set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable:

* on Linux or macOS: `export GOOGLE_APPLICATION_CREDENTIALS="service-account-dev.json"`
* on Windows PowerShell: `$env:GOOGLE_APPLICATION_CREDENTIALS="service-account-dev.json"`

**This has to be done every time you close your shell.**

### Using the emulators

By default, the real Firebase servers are used. If you want to use the Firebase emulators, run them
with `npm run local_backend` (**in the `functions` project, not `admin`**) and create a `.env` file
in the `admin` folder with this content:

```
USE_FIREBASE_EMULATORS=true
```

Note: if the Firebase emulators are not used even if the environment variable is set, it may be
because you did not call `initFirebase()` of `src/firebase_utils.ts` in your script.

### Run the tests

You can run the tests with `npm test`. These tests always use the emulators, so make sure they are
launched!

### Tools

* `npm run set_story_questions [questions.yaml]`: set the story questions for the current project
  (on the emulator if `USE_FIREBASE_EMULATORS` is `true`). By default,
  `admin/data/story/questions.yaml` is used.
