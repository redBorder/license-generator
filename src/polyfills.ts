import * as util from "util";

const isObject = (arg: any) => typeof arg === "object" && arg !== null;

const polyfills: any = {
  isBoolean: (arg: any): arg is boolean => typeof arg === "boolean",
  isFunction: (arg: any): arg is Function => typeof arg === "function",
  isNull: (arg: any): arg is null => arg === null,
  isNullOrUndefined: (arg: any): arg is null | undefined => arg === null || arg === undefined,
  isNumber: (arg: any): arg is number => typeof arg === "number",
  isObject: isObject,
  isString: (arg: any): arg is string => typeof arg === "string",
  isUndefined: (arg: any): arg is undefined => typeof arg === "undefined",
};

// These might already be present in some environments, but better safe.
if (!(util as any).isError) {
  (util as any).isError = (arg: any): arg is Error => arg instanceof Error;
}
if (!(util as any).isArray) {
  (util as any).isArray = Array.isArray;
}
if (!(util as any).isRegExp) {
  (util as any).isRegExp = (arg: any): arg is RegExp =>
    Object.prototype.toString.call(arg) === "[object RegExp]";
}

Object.keys(polyfills).forEach((key) => {
  if (!(util as any)[key]) {
    (util as any)[key] = polyfills[key];
  }
});
