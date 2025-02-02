import { HttpResponse } from "./http.interfaces.ts";

export interface HttpErrorHandler {
  handle(error: unknown): Promise<HttpResponse>;
}
