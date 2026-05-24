import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { IncomingMessage, ServerResponse } from "http";
import router from "./routes/index.js";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  // @ts-ignore - Vercel TS2349: Conflicto de tipos ESM/CJS al invocar pinoHttp
  pinoHttp({
    logger,
    serializers: {
      req(req: IncomingMessage & { id?: unknown }) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: ServerResponse) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  })
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;