import { createRequire } from "module";
const require = createRequire(import.meta.url);
const util = require("util");

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
if (!util.isError) {
  util.isError = (arg: any): arg is Error => arg instanceof Error;
}
if (!util.isArray) {
  util.isArray = Array.isArray;
}
if (!util.isRegExp) {
  util.isRegExp = (arg: any): arg is RegExp =>
    Object.prototype.toString.call(arg) === "[object RegExp]";
}

Object.keys(polyfills).forEach((key) => {
  if (!util[key]) {
    util[key] = polyfills[key];
  }
});
