import { buildApp } from "./app.js";
import { APP_URL } from "./common/constant.js";

const appUrl = new URL(APP_URL);
const port = Number(appUrl.port || 3000);
const host = appUrl.hostname;

const app = await buildApp();

try {
  await app.listen({ port, host });
  app.log.info(`API listening on ${APP_URL}`);
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
