import { app } from "./app";
import logger from "./logger/logger.ts";

const PORT = 3000;

export const server = app.listen(PORT, () => {
  logger.info(`Server started on PORT ${PORT}`);
});