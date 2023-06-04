# Configuration

If a configuration value is not recognized, it falls back to the default.

The values are case-insensitive.

## Frontend

In `bedtime-writer/.env`:

* `BACKEND`
    * `remote` (default): use the Cloud Function backend.
    * `local`: use the local backend.
* `DEBUG_AUTH`
    * `false` (default)
    * `true`: display helpful info about the user ID on the home screen, and a button to
      log in / log out easily.

## Backend

`functions/.env` is always read. Then, **only if using the Firebase emulators**,
`functions/.env.local` is read and overrides all previously set values.

In other words, when developing locally, edit `functions/.env.local`. If you wish to modify the
production settings, edit `functions/.env` (and redeploy).

* `RATE_LIMITER_MAX_REQUESTS_PER_DAY_USER`
    * default is `50`
    * The maximum number of requests per day and per user.
* `RATE_LIMITER_MAX_REQUESTS_PER_DAY_GLOBAL`
    * default is `1000`
    * The maximum number of requests per day globally.
* `TEXT_API`
    * `openai` (default): use OpenAI's text generation API. Use the Google Cloud Secret as a key,
      which can be read from `.secret.local` when using the Firebase emulators.
    * `fake`: use the fake text API.
* `FAKE_TEXT_API_NUM_PARTS`
    * between `1` and `10` (default)
    * The number of parts provided by the fake text API. A part is ended by two consecutive
      end-of-lines.
* `FAKE_TEXT_API_NUM_TOKENS_PER_PART`
    * between `1` and `200` (default)
    * The number of tokens per part.
* `FAKE_TEXT_API_START_WAIT`
    * between `0` and `10000` (default is `1500`)
    * The number of ms to wait before starting generating tokens (only for stream).
* `FAKE_TEXT_API_PART_WAIT`
    * between `0` and `10000` (default is `1500`)
    * The number of ms to wait between each part (only for stream).
* `IMAGE_API`
    * `openai` (default): use OpenAI's image generation API. Use the Google Cloud Secret as a key,
      which can be read from `.secret.local` when using the Firebase emulators.
    * `fake`: use the fake image API.
