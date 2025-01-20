import { MetadataManager } from "@tigerstack/core/internals";
import { RequestContext } from "../features/pipeline/request-context.ts";

// Parameter types that we can decorate
export enum ParamType {
  Body = "body",
  Query = "query",
  Param = "param",
  Header = "header",
}

interface ParameterConfig {
  index: number;
  type: ParamType;
  name?: string;
}

const PARAMS_METADATA_KEY = "http:params";

// Base decorator factory with proper metadata initialization
function createParamDecorator(type: ParamType, name?: string) {
  return (target: any, methodKey: string | symbol, parameterIndex: number) => {
    const existingParams: ParameterConfig[] =
      MetadataManager.getMetadata<ParameterConfig[]>(
        PARAMS_METADATA_KEY,
        target,
        methodKey as string,
      ) || [];

    // If we got back an empty object instead of an array, initialize it
    const params = Array.isArray(existingParams) ? existingParams : [];

    params.push({
      index: parameterIndex,
      type,
      name,
    });

    MetadataManager.setMetadata(
      PARAMS_METADATA_KEY,
      params,
      target,
      methodKey as string,
    );
  };
}

// Parameter decorators
export const Body = () => createParamDecorator(ParamType.Body);
export const Query = (name?: string) =>
  createParamDecorator(ParamType.Query, name);
export const Param = (name?: string) =>
  createParamDecorator(ParamType.Param, name);
export const Header = (name?: string) =>
  createParamDecorator(ParamType.Header, name);

// Helper to extract parameters
export function extractParameters(
  routeParams: Record<string, string>,
  target: any,
  methodName: string,
): any[] {
  const req = RequestContext.getRequest();
  if (!req) {
    throw new Error("No request context found - this is probably a bug");
  }

  const params: ParameterConfig[] =
    MetadataManager.getMetadata(PARAMS_METADATA_KEY, target, methodName) || [];

  // Ensure we have an array
  if (!Array.isArray(params)) {
    return [];
  }

  const sortedParams = params.sort((a, b) => a.index - b.index);

  return sortedParams.map((param) => {
    switch (param.type) {
      case ParamType.Body:
        return req.body;

      case ParamType.Query: {
        const queryString = req.url.split("?")[1] || "";
        const queryParams = new URLSearchParams(queryString);
        return param.name
          ? queryParams.get(param.name)
          : Object.fromEntries(queryParams);
      }

      case ParamType.Param:
        return param.name ? routeParams[param.name] : routeParams;

      case ParamType.Header:
        return param.name ? req.headers[param.name] : req.headers;

      default:
        return undefined;
    }
  });
}
