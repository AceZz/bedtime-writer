import { https } from "firebase-functions";

export const getUid = (context: https.CallableContext) => {
  const uid = context?.auth?.uid ?? null;
  if (uid !== null) {
    return uid;
  }
  throw new Error("User is not authenticated.");
};
