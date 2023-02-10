import env from "dotenv";
env.config();

const loadEnvironmentVariables = (keyName: string) => {
  const envVar = process.env[keyName];

  if (!envVar) {
    throw new Error(`Missing '${keyName}' environment variable`);
  }

  return envVar;
};

export const accessTokenPrivateKey = loadEnvironmentVariables(
  "ACCESS_TOKEN_PRIVATE_KEY"
);
export const port = Number(loadEnvironmentVariables("SERVER_PORT"));
export const serverHost = loadEnvironmentVariables("SERVER_HOST");
export const authRefreshTokenExpiration = Number(
  loadEnvironmentVariables("AUTH_REFRESH_TOKEN_EXPIRATION")
);
export const authTokenExpiration = Number(
  loadEnvironmentVariables("AUTH_TOKEN_EXPIRATION")
);
