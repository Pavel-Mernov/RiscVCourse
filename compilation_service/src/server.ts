import { app } from "./app.js";
import logger from "./logger/logger.js";

const PORT = 3000;

export const server = app.listen(PORT, () => {
  logger.info(`Server started on PORT ${PORT}`);
});