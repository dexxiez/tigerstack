/* eslint-disable @typescript-eslint/no-explicit-any -- Modular approach being defined so any is required to allow downstream to not hate life */
import { inject } from "./features/di/index.ts";
import { Logger } from "./features/logs/index.ts";
import { FrameworkErrorHandler } from "./features/errors/index.ts";
import { Constructor } from "./features/internals/index.ts";

// Interface for modules that need config
export interface ConfigurableModule<T = any> {
  configure(config: T): void;
  onBootstrap(): Promise<void> | void | null;
}

// Type guard to check if something is a configurable module
function isConfigurable(module: any): module is ConfigurableModule {
  return typeof module?.configure === "function";
}

// check if instance has onBootstrap
function hasOnBootstrap(instance: any): instance is ConfigurableModule {
  return typeof instance?.onBootstrap === "function";
}

export class TigerStack {
  private readonly modules = new Map<Constructor<any>, any>();
  private readonly logger: Logger;

  constructor(options: { debug?: boolean } = {}) {
    this.logger = new Logger({
      showSeverity: false,
      timestamp: options.debug ? "timeOnly" : false,
    });
  }

  /**
   * Register a module with optional configuration
   */
  register<T, C = undefined>(module: Constructor<T>, config?: C): this {
    this.modules.set(module, config);
    return this;
  }

  /**
   * Bootstrap the TigerStack instance and all registered modules
   */
  async bootstrap(): Promise<void> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      this.logger.info("Bootstrapping TigerStack...");

      // Initialize and configure all modules
      for (const [Module, config] of this.modules) {
        const instance = await inject(Module).catch((err) => {
          this.logger.error(`Failed to initialize module ${Module.name}`);
          throw err;
        });

        // If module has a configure method and config was provided, call it
        if (config && isConfigurable(instance)) {
          instance.configure(config);
          this.logger.debug(`Configured ${Module.name}`);
        }

        if (hasOnBootstrap(instance)) {
          if (instance.onBootstrap) {
            instance.onBootstrap();
          }
        }

        this.logger.debug(`Bootstrapped ${Module.name}`);
      }

      this.logger.info(`Successfully initialized ${this.modules.size} modules`);
    } catch (error) {
      FrameworkErrorHandler.handle(error);
      throw error;
    }
  }
}

export default TigerStack;
