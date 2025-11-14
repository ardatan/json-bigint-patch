import { stringify } from "./lib/stringify";
import { json_parse } from "./lib/parse";

let globalObj;

if (typeof globalThis !== "undefined") {
  globalObj = globalThis;
} else if (typeof self !== "undefined") {
  globalObj = self;
} else if (typeof window !== "undefined") {
  globalObj = window;
} else if (typeof global !== "undefined") {
  globalObj = global;
}

// Check for JSON.rawJSON support
if (JSON.rawJSON) {
  // Using toJSON() method to handle BigInt serialization
  BigInt.prototype.toJSON = function () {
    return JSON.rawJSON(this.toString());
  };
  const nativeParser = globalObj.JSON.parse;
  // Using reviver function to handle BigInt deserialization
  globalObj.JSON.parse = function JSONparseWithBigInt(text, reviver) {
    return nativeParser(text, function (key, value, context) {
      if (typeof value === "number") {
        if (context.source != value.toString()) {
          try {
            return BigInt(context.source);
          } catch (e) {
            // Not a valid BigInt, return the original number
          }
        }
      }
      return reviver ? reviver(key, value) : value;
    });
  };
// Fallback if JSON.rawJSON is not available
} else {
  globalObj.BigInt.prototype.toJSON = function () {
    return this;
  };
  globalObj.JSON.stringify = stringify;
  globalObj.JSON.parse = json_parse();
}
