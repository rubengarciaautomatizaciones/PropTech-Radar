import { Router, type Request, type Response } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router = Router();

// Usamos el tipado directo en la función de callback
router.get("/healthz", (req: Request, res: Response) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.status(200).json(data);
});

export default router;