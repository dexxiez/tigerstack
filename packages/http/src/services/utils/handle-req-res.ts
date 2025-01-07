import koa from "koa";
import { HttpRequest, HttpResponse } from "../../interfaces/http.ts";

export const handleRequest = (request: koa.Request): HttpRequest => {
  return {
    method: request.method as HttpRequest["method"],
    headers: request.headers as HttpRequest["headers"],
    url: request.url,
    body: request.toJSON(),
  };
};

export const handleResponse = (response: koa.Response): HttpResponse => {
  return {
    body: response.body,
    headers: response.headers as HttpResponse["headers"],
    status: response.status,
  };
};
