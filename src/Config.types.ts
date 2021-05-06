import { ArgsParserConstructor } from './ArgsParser';
import { Config } from './Config';

/**
 * Available types for Config data.
 */
export interface TypeMap {
  string: string;
  number: number;
  boolean: boolean;
}

/**
 * The config schema.
 */
export interface ConfigSchema {
  readonly [key: string]: keyof TypeMap;
}

/**
 * The Config object options.
 * @template Schema The schema type.
 */
export interface ConfigOptions<Schema extends ConfigSchema> {
  /** The CLI arguments. */
  args: string[];
  /** The path to load .env configuration. */
  envPath?: string;
  /** Custom Parser for parsing CLI arguments. */
  parser?: ArgsParserConstructor;
  /**
   * Callback once .env configuration is loaded.
   * @param config The Config object.
   */
  onLoadEnv?(config: Config<Schema>): void;
}

/**
 * The Config data.
 * @template Schema The schema type.
 */
export type ConfigData<Schema extends ConfigSchema> = {
  -readonly [key in keyof Schema]?: TypeMap[Schema[key]];
};

/**
 * The Config value. Type `undefined` is added if `defaultValue` is not set.
 * @template Schema The schema type.
 * @template Key The key of schema.
 * @template DefaultValue The default value type.
 */
export type ConfigValue<
  Schema extends ConfigSchema,
  Key extends keyof Schema = keyof Schema,
  DefaultValue extends ConfigData<Schema>[Key] = undefined
> = DefaultValue extends undefined
  ? ConfigData<Schema>[Key]
  : Exclude<ConfigData<Schema>[Key], undefined>;
