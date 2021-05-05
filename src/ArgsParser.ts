import { TypeMap } from './Config.types';

/** For instantiating ArgsParser. */
export interface ArgsParserConstructor {
  /**
   * @param args The CLI arguments.
   * @returns The ArgsParser object.
   */
  new (args: readonly string[]): ArgsParser;
}

/**
 * For parsing for CLI arguments.
 */
export class ArgsParser {
  protected readonly prefix: string = '--';

  /**
   * @param args The CLI arguments.
   */
  constructor(protected readonly args: readonly string[]) {}

  /**
   * Get the option index from `this.args`.
   * @param key The option key.
   * @returns The option index.
   */
  getIndex(key: string): number {
    const { args, prefix } = this;
    return args.findIndex((arg: string) => {
      // match exact `--option` or `--option=*`
      const option: string = prefix + key;
      return arg === option || arg.startsWith(option + '=');
    });
  }

  /**
   * Checks if an option exists from `this.args`.
   * @param key The option key.
   * @returns If option exists.
   */
  has(key: string): boolean {
    return this.getIndex(key) >= 0;
  }

  /**
   * Gets an option from `this.args`.
   * @param key The option key.
   * @returns The option value.
   */
  protected _get(key: string): string | boolean | undefined {
    const keyIndex: number = this.getIndex(key);
    // use value after "=" sign, the next arg, or use true
    if (keyIndex < 0) {
      return undefined;
    }
    const optionValue: string =
      this.args[keyIndex].split('=')[1] || this.args[keyIndex + 1] || '';
    // return true if it's another option
    return optionValue.startsWith(this.prefix) || optionValue || true;
  }

  /**
   * Gets an option from `this.args` of given type.
   * @param key The option key.
   * @param type The `typeof` option.
   * @returns The option value.
   */
  get<Type extends keyof TypeMap>(
    key: string,
    type: Type
  ): TypeMap[Type] | undefined {
    const option: string | boolean | undefined = this._get(key);
    // option is true if not "false"
    if (type === 'boolean' && this.has(key)) {
      const value: boolean | undefined =
        typeof option === 'string' ? option !== 'false' : option;
      return value as TypeMap[Type] | undefined;
    } else if (type === 'number') {
      const n: number = parseFloat(`${option}`);
      if (isFinite(n)) {
        return n as TypeMap[Type];
      }
    } else if (typeof option === type) {
      return option as TypeMap[Type];
    }
  }
}
