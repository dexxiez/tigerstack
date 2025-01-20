import { HttpRequest, HttpResponse } from "../../types/http.interfaces.ts";

// Tracks the current request context through the pipeline
export class RequestContext {
  private static currentRequest: HttpRequest;
  private static currentResponse: HttpResponse;

  static setContext(req: HttpRequest, res: HttpResponse) {
    this.currentRequest = req;
    this.currentResponse = res;
  }

  static getRequest(): HttpRequest {
    return this.currentRequest;
  }

  static getResponse(): HttpResponse {
    return this.currentResponse;
  }

  static clear() {
    this.currentRequest = undefined!;
    this.currentResponse = undefined!;
  }
}
