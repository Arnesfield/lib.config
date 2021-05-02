import * as dotenvFlow from 'dotenv-flow';
import { ArgsParser, ArgsParserConstructor } from './ArgsParser';
import {
  ConfigData,
  ConfigOptions,
  ConfigSchema,
  ConfigValue
} from './Config.types';

/**
 * Stores configuration.
 */
export class Config<Schema extends ConfigSchema = ConfigSchema> {
  /** Static reference to Config. */
  protected ['constructor']: typeof Config;
  private readonly args: readonly string[];
  private readonly data: ConfigData<Schema> = {};
  private readonly parserClass: ArgsParserConstructor;
  private static didLoadEnv: boolean = false;

  /**
   * @param schema The schema object.
   * @param argsOrOptions The CLI arguments or Config options.
   */
  constructor(
    private readonly schema: Schema,
    argsOrOptions: ConfigOptions<Schema> | ConfigOptions<Schema>['args']
  ) {
    const options: ConfigOptions<Schema> = Array.isArray(argsOrOptions)
      ? { args: argsOrOptions }
      : argsOrOptions;
    const { args = [], envPath, parser = ArgsParser, onLoadEnv } = options;
    this.parserClass = parser;
    this.args = Object.freeze(args);
    this.setConfigData();
    if (typeof envPath !== 'undefined') {
      this.loadEnvConfigOnce(envPath, onLoadEnv);
    }
  }

  /**
   * Loads environment variables once.
   * @param path The path to load .env configuration.
   * @param onLoad Callback once .env configuration is loaded.
   */
  private loadEnvConfigOnce(
    path: string,
    onLoad?: ConfigOptions<Schema>['onLoadEnv']
  ): void {
    if (!this.constructor.didLoadEnv) {
      dotenvFlow.config({ path });
      this.constructor.didLoadEnv = true;
      onLoad?.(this);
    }
  }

  /**
   * Set the config data.
   */
  private setConfigData(): void {
    type Key = keyof Schema;
    const { args, schema } = this;
    const keys: Key[] = Object.keys(schema) as Key[];
    if (keys.length > 0) {
      const parser: ArgsParser = new this.parserClass(args);
      for (const key of keys) {
        this.set(key, parser.get(key.toString(), schema[key]));
      }
    }
  }

  /**
   * Get the CLI arguments.
   * @returns The CLI arguments.
   */
  getArgs(): readonly string[] {
    return this.args;
  }

  /**
   * Get the config value by key.
   * @param key The config key.
   * @param defaultValue The config default value.
   * @returns The config value.
   */
  get<
    Key extends keyof Schema,
    DefaultValue extends ConfigValue<Schema, Key> = undefined
  >(
    key: Key,
    defaultValue?: DefaultValue
  ): ConfigValue<Schema, Key, DefaultValue> {
    const data: ConfigValue<Schema, Key> | undefined = this.data[key];
    const val: ConfigValue<Schema, Key> =
      typeof data === 'undefined' && typeof defaultValue !== 'undefined'
        ? defaultValue
        : data;
    return val as ConfigValue<Schema, Key, DefaultValue>;
  }

  /**
   * Set the config value by key.
   * @param key The config key.
   * @param value The config value.
   * @returns The Config object.
   */
  set<Key extends keyof Schema>(
    key: Key,
    value: ConfigValue<Schema, Key>
  ): this {
    this.data[key] = value;
    return this;
  }
}
