import { UserFeedback } from "../../../src/user/feedback";
/**
 * A dummy feedback.
 */
export const FEEDBACK_JSON_0 = {
  text: "test-feedback",
  datetime: new Date(),
  uid: "test-user",
};

export const FEEDBACK_0 = new UserFeedback(
  FEEDBACK_JSON_0.text,
  FEEDBACK_JSON_0.datetime,
  FEEDBACK_JSON_0.uid
);
