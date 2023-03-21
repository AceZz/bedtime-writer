export const getUid = (context) => {
  const uid = context?.auth?.uid ?? null;
  if (uid !== null) {
    return uid;
  }
  throw new Error("User is not authenticated.");
};
