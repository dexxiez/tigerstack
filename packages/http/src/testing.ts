// THIS FILE IS FOR DEVELOPMENT AND SERVES NO PERMANENT PURPOSE

import { TigerStack } from "@tigerstack/core";
import { HTTPTigerMod } from "./server.ts";

const app = new TigerStack({ debug: true });

app
  .register(HTTPTigerMod, {
    port: 3000,
  })
  .bootstrap();
