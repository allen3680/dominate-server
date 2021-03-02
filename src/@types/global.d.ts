declare interface String {
  format: (data: unknown[] | { [key: string]: any }) => string;
  toMaskUid: () => string;
}

declare interface Date {
  format: (template?: string) => string;
}

declare interface Array<T> {
  first: () => T;
  groupBy: (propName: string) => { [key: string]: T[] };
}

declare interface JSON {
  tryStringify: (
    value: any,
    replacer?: (this: any, key: string, value: any) => any,
    space?: string | number,
  ) => string;

  tryParse<T = any>(
    text: string,
    reviver?: (this: any, key: string, value: any) => any,
  ): T;
}
