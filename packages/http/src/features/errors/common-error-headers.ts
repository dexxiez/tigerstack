import { HttpHeader } from "../../types/http.types.ts";

export const commonErrorHeaders: Partial<Record<HttpHeader, string>> = {
  "Content-Type": "application/json",
};
