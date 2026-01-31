import {
  DynamicModule,
  Global,
  Inject,
  Injectable,
  InjectionToken,
  LoggerService,
  MiddlewareConsumer,
  Module,
  ModuleMetadata,
  NestModule,
  OptionalFactoryDependency,
  Provider,
  Scope,
} from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { IncomingMessage, ServerResponse } from 'http';
import pino, { DestinationStream, Level, Logger as PinoTypesLogger } from 'pino';
import { Options, pinoHttp } from 'pino-http';

export const PARAMS_PROVIDER_TOKEN = 'pino-params';

export class Store {
  constructor(
    public logger: PinoTypesLogger,
    public responseLogger?: PinoTypesLogger
  ) {}
}

export const storage = new AsyncLocalStorage<Store>();

export interface Params {
  pinoHttp?:
    | Options<IncomingMessage, ServerResponse, string>
    | DestinationStream
    | [Options<IncomingMessage, ServerResponse, string>, DestinationStream];
}

export interface LoggerModuleAsyncParams
  extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  useFactory: (...args: unknown[]) => Params | Promise<Params>;
  inject?: (InjectionToken | OptionalFactoryDependency)[] | undefined;
}

export type PassedLogger = { logger?: PinoTypesLogger<string> };

export function isPassedLogger(
  pinoHttpProp: Params['pinoHttp']
): pinoHttpProp is PassedLogger {
  return !!pinoHttpProp && 'logger' in pinoHttpProp;
}

type PinoMethods = Pick<
  pino.Logger,
  'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'
>;

type LoggerFn =
  | ((msg: string, ...args: unknown[]) => void)
  | ((obj: object, msg?: string, ...args: unknown[]) => void);

let outOfContext: pino.Logger | undefined;

@Injectable({ scope: Scope.TRANSIENT })
export class PinoLogger implements PinoMethods {
  static readonly root: pino.Logger;

  protected context = '';
  protected readonly contextName: string = 'context';
  protected readonly errorKey: string = 'err';

  constructor(@Inject(PARAMS_PROVIDER_TOKEN) params: Params) {
    const { pinoHttp } = params;

    if (
      typeof pinoHttp === 'object' &&
      'customAttributeKeys' in pinoHttp &&
      typeof pinoHttp.customAttributeKeys !== 'undefined'
    ) {
      this.errorKey = pinoHttp.customAttributeKeys.err ?? 'err';
    }

    if (!outOfContext) {
      if (Array.isArray(pinoHttp)) {
        outOfContext = pino(...pinoHttp);
      } else if (isPassedLogger(pinoHttp)) {
        // biome-ignore lint/suspicious/noExplicitAny: pino types compatibility
        outOfContext = pinoHttp.logger as any;
      } else if (
        typeof pinoHttp === 'object' &&
        'stream' in pinoHttp &&
        typeof pinoHttp.stream !== 'undefined'
      ) {
        outOfContext = pino(
          pinoHttp as pino.LoggerOptions,
          pinoHttp.stream as DestinationStream
        );
      } else {
        outOfContext = pino(pinoHttp as pino.LoggerOptions | DestinationStream);
      }
    }
  }

  get logger(): pino.Logger {
    return storage.getStore()?.logger || outOfContext!;
  }

  trace(msg: string, ...args: unknown[]): void;
  trace(obj: unknown, msg?: string, ...args: unknown[]): void;
  // biome-ignore lint/suspicious/noExplicitAny: generic implementation
  trace(...args: any[]) {
    this.call('trace', ...(args as Parameters<LoggerFn>));
  }

  debug(msg: string, ...args: unknown[]): void;
  debug(obj: unknown, msg?: string, ...args: unknown[]): void;
  // biome-ignore lint/suspicious/noExplicitAny: generic implementation
  debug(...args: any[]) {
    this.call('debug', ...(args as Parameters<LoggerFn>));
  }

  info(msg: string, ...args: unknown[]): void;
  info(obj: unknown, msg?: string, ...args: unknown[]): void;
  // biome-ignore lint/suspicious/noExplicitAny: generic implementation
  info(...args: any[]) {
    this.call('info', ...(args as Parameters<LoggerFn>));
  }

  warn(msg: string, ...args: unknown[]): void;
  warn(obj: unknown, msg?: string, ...args: unknown[]): void;
  // biome-ignore lint/suspicious/noExplicitAny: generic implementation
  warn(...args: any[]) {
    this.call('warn', ...(args as Parameters<LoggerFn>));
  }

  error(msg: string, ...args: unknown[]): void;
  error(obj: unknown, msg?: string, ...args: unknown[]): void;
  // biome-ignore lint/suspicious/noExplicitAny: generic implementation
  error(...args: any[]) {
    this.call('error', ...(args as Parameters<LoggerFn>));
  }

  fatal(msg: string, ...args: unknown[]): void;
  fatal(obj: unknown, msg?: string, ...args: unknown[]): void;
  // biome-ignore lint/suspicious/noExplicitAny: generic implementation
  fatal(...args: any[]) {
    this.call('fatal', ...(args as Parameters<LoggerFn>));
  }

  setContext(value: string) {
    this.context = value;
  }

  assign(fields: pino.Bindings) {
    const store = storage.getStore();
    if (!store) {
      throw new Error(
        `${PinoLogger.name}: unable to assign extra fields out of request scope`
      );
    }
    store.logger = store.logger.child(fields);
    store.responseLogger?.setBindings(fields);
  }

  protected call(method: pino.Level, ...args: Parameters<LoggerFn>) {
    if (this.context) {
      if (isFirstArgObject(args)) {
        const firstArg = args[0];
        if (firstArg instanceof Error) {
          args = [
            Object.assign(
              { [this.contextName]: this.context },
              { [this.errorKey]: firstArg }
            ),
            ...args.slice(1),
            // biome-ignore lint/suspicious/noExplicitAny: args manipulation
          ] as any;
        } else {
          args = [
            Object.assign({ [this.contextName]: this.context }, firstArg),
            ...args.slice(1),
            // biome-ignore lint/suspicious/noExplicitAny: args manipulation
          ] as any;
        }
      } else {
        args = [
          { [this.contextName]: this.context },
          ...args,
          // biome-ignore lint/suspicious/noExplicitAny: args manipulation
        ] as any;
      }
    }

    // @ts-ignore args are union of tuple types
    this.logger[method](...args);
  }
}

function isFirstArgObject(
  args: Parameters<LoggerFn>
): args is [obj: object, msg?: string, ...args: unknown[]] {
  return typeof args[0] === 'object';
}

@Injectable()
export class Logger implements LoggerService {
  private readonly contextName: string = 'context';

  constructor(protected readonly logger: PinoLogger) {}

  // biome-ignore lint/suspicious/noExplicitAny: standard logger signature
  verbose(message: string, ...optionalParams: any[]) {
    this.call('trace', message, ...optionalParams);
  }

  // biome-ignore lint/suspicious/noExplicitAny: standard logger signature
  debug(message: string, ...optionalParams: any[]) {
    this.call('debug', message, ...optionalParams);
  }

  // biome-ignore lint/suspicious/noExplicitAny: standard logger signature
  log(message: string, ...optionalParams: any[]) {
    this.call('info', message, ...optionalParams);
  }

  // biome-ignore lint/suspicious/noExplicitAny: standard logger signature
  warn(message: string, ...optionalParams: any[]) {
    this.call('warn', message, ...optionalParams);
  }

  // biome-ignore lint/suspicious/noExplicitAny: standard logger signature
  error(message: string, ...optionalParams: any[]) {
    this.call('error', message, ...optionalParams);
  }

  // biome-ignore lint/suspicious/noExplicitAny: standard logger signature
  fatal(message: string, ...optionalParams: any[]) {
    this.call('fatal', message, ...optionalParams);
  }

  // biome-ignore lint/suspicious/noExplicitAny: internal handler
  private call(level: Level, message: any, ...optionalParams: any[]) {
    // biome-ignore lint/suspicious/noExplicitAny: internal structure
    const objArg: Record<string, any> = {};

    // optionalParams contains extra params passed to logger
    // context name is the last item
    // biome-ignore lint/suspicious/noExplicitAny: generic params
    let params: any[] = [];
    if (optionalParams.length !== 0) {
      objArg[this.contextName] = optionalParams[optionalParams.length - 1];
      params = optionalParams.slice(0, -1);
    }

    if (typeof message === 'object') {
      if (message instanceof Error) {
        objArg.err = message;
      } else {
        Object.assign(objArg, message);
      }
      this.logger[level](objArg, ...params);
    } else if (this.isWrongExceptionsHandlerContract(level, message, params)) {
      objArg.err = new Error(message);
      objArg.err.stack = params[0];
      this.logger[level](objArg);
    } else {
      this.logger[level](objArg, message, ...params);
    }
  }

  private isWrongExceptionsHandlerContract(
    level: Level,
    // biome-ignore lint/suspicious/noExplicitAny: dynamic check
    message: any,
    // biome-ignore lint/suspicious/noExplicitAny: dynamic check
    params: any[]
  ): params is [string] {
    return (
      level === 'error' &&
      typeof message === 'string' &&
      params.length === 1 &&
      typeof params[0] === 'string' &&
      /\n\s*at /.test(params[0])
    );
  }
}

const decoratedLoggers = new Set<string>();
const decoratedTokenPrefix = 'PinoLogger:';

export function getLoggerToken(context: string): string {
  return `${decoratedTokenPrefix}${context}`;
}

export function InjectPinoLogger(context = '') {
  decoratedLoggers.add(context);
  return Inject(getLoggerToken(context));
}

export function createProvidersForDecorated(): Array<Provider<PinoLogger>> {
  return [...decoratedLoggers.values()].map(createDecoratedLoggerProvider);
}

function createDecoratedLoggerProvider(context: string): Provider<PinoLogger> {
  return {
    provide: getLoggerToken(context),
    useFactory: (logger: PinoLogger) => {
      logger.setContext(context);
      return logger;
    },
    inject: [PinoLogger],
  };
}

@Global()
@Module({ providers: [Logger], exports: [Logger] })
export class LoggerModule implements NestModule {
  static forRoot(params?: Params | undefined): DynamicModule {
    const paramsProvider: Provider<Params> = {
      provide: PARAMS_PROVIDER_TOKEN,
      useValue: params || {},
    };

    const decorated = createProvidersForDecorated();

    return {
      module: LoggerModule,
      providers: [Logger, ...decorated, PinoLogger, paramsProvider],
      exports: [Logger, ...decorated, PinoLogger, paramsProvider],
    };
  }

  static forRootAsync(params: LoggerModuleAsyncParams): DynamicModule {
    const paramsProvider: Provider<Params | Promise<Params>> = {
      provide: PARAMS_PROVIDER_TOKEN,
      useFactory: params.useFactory,
      inject: params.inject,
    };

    const decorated = createProvidersForDecorated();

    // biome-ignore lint/suspicious/noExplicitAny: flexible providers
    const providers: any[] = [
      Logger,
      ...decorated,
      PinoLogger,
      paramsProvider,
      ...(params.providers || []),
    ];

    return {
      module: LoggerModule,
      imports: params.imports,
      providers,
      exports: [Logger, ...decorated, PinoLogger, paramsProvider],
    };
  }

  constructor(@Inject(PARAMS_PROVIDER_TOKEN) private readonly params: Params) {}

  configure(consumer: MiddlewareConsumer) {
    const { pinoHttp } = this.params;
    const middlewares = createLoggerMiddlewares(pinoHttp || {});
    consumer.apply(...middlewares);
  }
}

function createLoggerMiddlewares(
  params: NonNullable<Params['pinoHttp']>,
  useExisting = false,
  assignResponse = false
) {
  if (useExisting) {
    return [bindLoggerMiddlewareFactory(useExisting, assignResponse)];
  }

  // biome-ignore lint/suspicious/noExplicitAny: casting for pinoHttp overloading
  const middleware = pinoHttp(...(Array.isArray(params) ? params : [params as any]));

  // @ts-expect-error: root is readonly field, but this is the place where it's set actually
  PinoLogger.root = middleware.logger;

  return [middleware, bindLoggerMiddlewareFactory(useExisting, assignResponse)];
}

function bindLoggerMiddlewareFactory(useExisting: boolean, assignResponse: boolean) {
  return function bindLoggerMiddleware(
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ) {
    // biome-ignore lint/suspicious/noExplicitAny: extending request object
    let log = (req as any).log;
    // biome-ignore lint/suspicious/noExplicitAny: extending response object
    let resLog = assignResponse ? (res as any).log : undefined;

    // biome-ignore lint/suspicious/noExplicitAny: extending request object
    if (!useExisting && (req as any).allLogs) {
      // biome-ignore lint/suspicious/noExplicitAny: extending request object
      log = (req as any).allLogs[(req as any).allLogs.length - 1]!;
    }
    // biome-ignore lint/suspicious/noExplicitAny: extending response object
    if (assignResponse && !useExisting && (res as any).allLogs) {
      // biome-ignore lint/suspicious/noExplicitAny: extending response object
      resLog = (res as any).allLogs[(res as any).allLogs.length - 1]!;
    }

    storage.run(new Store(log, resLog), next);
  };
}
