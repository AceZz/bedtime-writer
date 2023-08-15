import { jest } from "@jest/globals";
import { initEnv } from "../src/firebase";
import { parseEnvAsNumber } from "../src/utils";

initEnv();

// Increase timeout locally
jest.setTimeout(parseEnvAsNumber("JEST_TIMEOUT", 5000));

// Silence the logger.
jest.mock("../src/logger");
