import { HttpRequest, HttpResponse } from "./http.ts";

export abstract class MiddlewareButNotInAGayWay {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  abstract request(req: HttpRequest): Promise<HttpRequest>;
  abstract response(res: HttpResponse): Promise<HttpResponse>;
}
