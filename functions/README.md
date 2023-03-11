# Firebase Cloud Functions

This folder contains the Firebase Cloud Functions for the project.

## Environment file

Create a `.env` file in this folder. **This file should never be committed!**

This file may contain the following keys:

- `OPENAI_API_KEY`: mandatory.
- `FAKE_DATA`: defaults to `false`. If `true`, Open AI APIs are not called, and
  synthetic data is returned.
