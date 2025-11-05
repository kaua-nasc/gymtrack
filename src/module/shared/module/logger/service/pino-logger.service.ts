import pino, { Logger } from 'pino';
import { Options } from 'pino-http';
import {
  DynamicModule,
  Inject,
  Injectable,
  MiddlewareConsumer,
  ModuleMetadata,
  NestModule,
  Scope,
} from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export class Store {
  constructor(
    public logger: Logger,
    public responseLogger?: Logger
  ) {}
}

export const storage = new AsyncLocalStorage<Store>();

export interface Params {
  pinoHttp?:
    | Options<any, any, any>
    | pino.DestinationStream
    | [Options<any, any, any>, pino.DestinationStream];
}

export interface LoggerModuleAsyncParams
  extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  useFactory: (...args: any[]) => Params | Promise<Params>;
  inject?: any[];
}

export const PARAMS_PROVIDER_TOKEN = 'pino-params';

export type PassedLogger = { logger: Logger };
export function isPassedLogger(pinoHttpProp: any): pinoHttpProp is PassedLogger {
  return !!pinoHttpProp && 'logger' in pinoHttpProp;
}

export declare class PinoLoggerModule implements NestModule {
  private readonly params;
  static forRoot(params?: Params | undefined): DynamicModule;
  static forRootAsync(params: LoggerModuleAsyncParams): DynamicModule;
  constructor(params: Params);
  configure(consumer: MiddlewareConsumer): void;
}

type PinoMethods = Pick<
  pino.Logger,
  'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'
>;

type LoggerFn =
  | ((msg: string, ...args: any[]) => void)
  | ((obj: object, msg?: string, ...args: any[]) => void);

let outOfContext: pino.Logger | undefined;

@Injectable({ scope: Scope.TRANSIENT })
export class PinoLogger implements PinoMethods {
  /**
   * root is the most root logger that can be used to change params at runtime.
   * Accessible only when `useExisting` is not set to `true` in `Params`.
   * Readonly, but you can change it's properties.
   */
  static readonly root: pino.Logger;

  protected context = '';
  protected readonly contextName: string = 'context';
  protected readonly errorKey: string = 'err';

  constructor(@Inject(PARAMS_PROVIDER_TOKEN) { pinoHttp }: Params) {
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
        outOfContext = pinoHttp.logger;
      } else if (
        typeof pinoHttp === 'object' &&
        'stream' in pinoHttp &&
        typeof pinoHttp.stream !== 'undefined'
      ) {
        outOfContext = pino(pinoHttp, pinoHttp.stream);
      } else {
        outOfContext = pino(pinoHttp);
      }
    }
  }

  get logger(): pino.Logger {
    // outOfContext is always set in runtime before starts using

    return storage.getStore()?.logger || outOfContext!;
  }

  trace(msg: string, ...args: any[]): void;
  trace(obj: unknown, msg?: string, ...args: any[]): void;
  trace(...args: Parameters<LoggerFn>) {
    this.call('trace', ...args);
  }

  debug(msg: string, ...args: any[]): void;
  debug(obj: unknown, msg?: string, ...args: any[]): void;
  debug(...args: Parameters<LoggerFn>) {
    this.call('debug', ...args);
  }

  info(msg: string, ...args: any[]): void;
  info(obj: unknown, msg?: string, ...args: any[]): void;
  info(...args: Parameters<LoggerFn>) {
    this.call('info', ...args);
  }

  warn(msg: string, ...args: any[]): void;
  warn(obj: unknown, msg?: string, ...args: any[]): void;
  warn(...args: Parameters<LoggerFn>) {
    this.call('warn', ...args);
  }

  error(msg: string, ...args: any[]): void;
  error(obj: unknown, msg?: string, ...args: any[]): void;
  error(...args: Parameters<LoggerFn>) {
    this.call('error', ...args);
  }

  fatal(msg: string, ...args: any[]): void;
  fatal(obj: unknown, msg?: string, ...args: any[]): void;
  fatal(...args: Parameters<LoggerFn>) {
    this.call('fatal', ...args);
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
          ];
        } else {
          args = [
            Object.assign({ [this.contextName]: this.context }, firstArg),
            ...args.slice(1),
          ];
        }
      } else {
        args = [{ [this.contextName]: this.context }, ...args];
      }
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore args are union of tuple types
    this.logger[method](...args);
  }
}

function isFirstArgObject(
  args: Parameters<LoggerFn>
): args is [obj: object, msg?: string, ...args: any[]] {
  return typeof args[0] === 'object';
}
