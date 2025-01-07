// THIS FILE IS FOR DEVELOPMENT AND SERVES NO PERMANENT PURPOSE

import { TigerHTTP } from "./server.ts";

const server = new TigerHTTP(3000);

server.start();
