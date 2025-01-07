export type HttpMethod = "POST" | "GET" | "PUT" | "PATCH" | "DELETE";

export type HttpHeader =
  | "Accept"
  | "Accept-Charset"
  | "Accept-Encoding"
  | "Accept-Language"
  | "Authorization"
  | "Cache-Control"
  | "Connection"
  | "Content-Length"
  | "Content-Type"
  | "Cookie"
  | "Host"
  | "If-Match"
  | "If-Modified-Since"
  | "If-None-Match"
  | "Origin"
  | "Pragma"
  | "Referer"
  | "User-Agent"
  | "X-Forwarded-For"
  | "X-Requested-With"
  | (string & {});
