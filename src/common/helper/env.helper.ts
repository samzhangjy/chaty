import { existsSync } from 'fs';
import { resolve } from 'path';

export const getEnvPath = (dest: string) => {
  const env = process.env.NODE_ENV;
  const fallback: string = resolve(`${dest}/.env`);
  const filename = env ? `${env}.env` : 'development.env';
  let filePath: string = resolve(`${dest}/${filename}`);

  if (!existsSync(filePath)) {
    filePath = fallback;
  }

  return filePath;
};
