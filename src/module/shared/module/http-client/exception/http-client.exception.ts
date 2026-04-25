export class HttpClientInternalException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class HttpClientException extends Error {
  public override cause: unknown;
  public statusCode?: number;
  public method?: string;
  public url?: string;

  constructor(
    message: string,
    cause?: unknown,
    details?: { statusCode?: number; method?: string; url?: string }
  ) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;
    this.statusCode = details?.statusCode;
    this.method = details?.method;
    this.url = details?.url;
  }
}

export class HttpClientTimeoutException extends HttpClientException {}
