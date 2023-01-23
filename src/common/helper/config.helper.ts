export interface ChatyConfig {
  PORT: number;
  BASE_URL: string;

  DATABASE_HOST: string;
  DATABASE_NAME: string;
  DATABASE_USER: string;
  DATABASE_PASSWORD: string;
  DATABASE_PORT: number;
  IS_DEVELOPMENT: boolean;
  JWT_KEY: string;
  JWT_EXPIRES: string;

  query: {
    limit: number;
  };
}
