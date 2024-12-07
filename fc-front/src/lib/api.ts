import { hc } from "hono/client";
import type { ApiRoutes } from "@server/index";

const client = hc("/") as unknown as ApiRoutes;

export const api = client;
