import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { IncomingMessage, ServerResponse } from "http";
import router from "./routes";
import { logger } from "./lib/logger";

// Extendemos el tipo nativo de Node para que TypeScript reconozca el 'id' que inyecta pino
interface PinoRequest extends IncomingMessage {
  id?: string | number;
}

const app: Express = express();

// @ts-expect-error - Ignoramos el falso positivo de tipo callable por el conflicto ESM/CJS en Vercel
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: PinoRequest) {
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