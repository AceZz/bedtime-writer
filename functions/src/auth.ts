import { AuthData } from "firebase-functions/lib/common/providers/https";

export const getUid = (auth?: AuthData) => {
  const uid = auth?.uid ?? null;
  if (uid !== null) {
    return uid;
  }
  throw new Error("User is not authenticated.");
};
