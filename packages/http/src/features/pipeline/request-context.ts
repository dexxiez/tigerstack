import { AsyncLocalStorage } from "async_hooks";
import { HttpRequest, HttpResponse } from "../../types/http.interfaces.ts";

interface RequestStore {
  request: HttpRequest;
  response: HttpResponse;
  // Add a generic object for custom data
  customData: Record<string, unknown>;
}

export class RequestContext {
  public static storage = new AsyncLocalStorage<RequestStore>();

  static setContext(
    req: HttpRequest,
    res: HttpResponse,
    customData: Record<string, unknown> = {},
  ) {
    this.storage.enterWith({ request: req, response: res, customData });
  }

  static getRequest(): HttpRequest {
    const store = this.storage.getStore();
    if (!store)
      throw new Error(
        "Accessing request outside context - did you forget to set it?",
      );
    return store.request;
  }

  static getResponse(): HttpResponse {
    const store = this.storage.getStore();
    if (!store)
      throw new Error(
        "Accessing response outside context - did you forget to set it?",
      );
    return store.response;
  }

  // Add a method to get custom data
  static getCustomData<T = unknown>(key: string): T | undefined {
    const store = this.storage.getStore();
    return store?.customData[key] as T;
  }

  // Add a method to set custom data
  static setCustomData(key: string, value: unknown): void {
    const store = this.storage.getStore();
    if (store) {
      store.customData[key] = value;
    }
  }

  static clear(): void {
    this.storage.exit(() => Promise.resolve());
  }
}
