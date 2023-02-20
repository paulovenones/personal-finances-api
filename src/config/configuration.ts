import env from "dotenv";

env.config();

const loadEnvironmentVariables = (keyName: string) => {
  const envVar = process.env[keyName];

  if (!envVar) {
    throw new Error(`Missing '${keyName}' environment variable`);
  }

  return envVar;
};

export const ACCESS_TOKEN_PRIVATE_KEY = loadEnvironmentVariables(
  "ACCESS_TOKEN_PRIVATE_KEY"
);
export const PORT = Number(loadEnvironmentVariables("SERVER_PORT"));
export const SERVER_HOST = loadEnvironmentVariables("SERVER_HOST");
export const AUTH_REFRESH_TOKEN_EXPIRATION = Number(
  loadEnvironmentVariables("AUTH_REFRESH_TOKEN_EXPIRATION")
);
export const AUTH_TOKEN_EXPIRATION = Number(
  loadEnvironmentVariables("AUTH_TOKEN_EXPIRATION")
);
export const REDIS_HOST = loadEnvironmentVariables("REDIS_HOST");
export const REDIS_PORT = Number(loadEnvironmentVariables("REDIS_PORT"));
export const NODE_ENV = loadEnvironmentVariables("NODE_ENV");
export const CLIENT_URL = loadEnvironmentVariables("CLIENT_URL");
export const SENDGRID_API_KEY = loadEnvironmentVariables("SENDGRID_API_KEY");
export const VERIFY_REGISTRATION_PIN_EXPIRATION = Number(
  loadEnvironmentVariables("VERIFY_REGISTRATION_PIN_EXPIRATION")
);
