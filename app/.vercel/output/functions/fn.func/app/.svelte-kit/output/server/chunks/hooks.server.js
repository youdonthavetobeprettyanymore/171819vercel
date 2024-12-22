import { a as assertEnvVar, c as client } from "./client.js";
import { w as writable, d as derived } from "./index2.js";
import { getPublishedId, studioPath, studioPathToJsonPath, resolveEditInfo, jsonPathToStudioPath } from "@sanity/client/csm";
import { e as error, r as redirect } from "./index.js";
import crypto from "crypto";
const schemaType = "sanity.previewUrlSecret", schemaIdPrefix = "sanity-preview-url-secret", schemaIdSingleton = `${schemaIdPrefix}.share-access`, schemaTypeSingleton = "sanity.previewUrlShareAccess", apiVersion = "2023-11-09", urlSearchParamPreviewSecret = "sanity-preview-secret", urlSearchParamPreviewPathname = "sanity-preview-pathname", urlSearchParamPreviewPerspective = "sanity-preview-perspective", isDev = process.env.NODE_ENV === "development", SECRET_TTL = 60 * 60, fetchSecretQuery = (
  /* groq */
  `*[_type == "${schemaType}" && secret == $secret && dateTime(_updatedAt) > dateTime(now()) - ${SECRET_TTL}][0]{
    _id,
    _updatedAt,
    secret,
    studioUrl,
  }`
), fetchSharedAccessSecretQuery = (
  /* groq */
  `*[_id == "${schemaIdSingleton}" && _type == "${schemaTypeSingleton}" && secret == $secret][0]{
  secret,
  studioUrl,
}`
), tag = "sanity.preview-url-secret";
function createClientWithConfig(client2) {
  if (!client2)
    throw new TypeError("`client` is required");
  if (!client2.config().token)
    throw new TypeError("`client` must have a `token` specified");
  return client2.withConfig({
    perspective: "raw",
    // Userland might be using an API version that's too old to use perspectives
    apiVersion,
    // We can't use the CDN, the secret is typically validated right after it's created
    useCdn: false,
    // Don't waste time returning a source map, we don't need it
    resultSourceMap: false,
    // @ts-expect-error - If stega is enabled, make sure it's disabled
    stega: false
  });
}
function parsePreviewUrl(unsafeUrl) {
  const url = new URL(unsafeUrl, "http://localhost"), secret = url.searchParams.get(urlSearchParamPreviewSecret);
  if (!secret)
    throw new Error("Missing secret");
  const studioPreviewPerspective = url.searchParams.get(urlSearchParamPreviewPerspective);
  let redirectTo;
  const unsafeRedirectTo = url.searchParams.get(urlSearchParamPreviewPathname);
  if (unsafeRedirectTo) {
    const { pathname, search, hash } = new URL(unsafeRedirectTo, "http://localhost");
    redirectTo = `${pathname}${search}${hash}`;
  }
  return { secret, redirectTo, studioPreviewPerspective };
}
async function validateSecret(client2, secret, disableCacheNoStore) {
  if (typeof EdgeRuntime < "u" && await new Promise((resolve) => setTimeout(resolve, 300)), !secret || !secret.trim())
    return { isValid: false, studioUrl: null };
  const { private: privateSecret, public: publicSecret } = await client2.fetch(
    `{
      "private": ${fetchSecretQuery},
      "public": ${fetchSharedAccessSecretQuery}
    }`,
    { secret },
    {
      tag,
      // In CloudFlare Workers we can't pass the cache header
      ...disableCacheNoStore ? void 0 : { cache: "no-store" }
    }
  );
  return privateSecret ? !privateSecret?._id || !privateSecret?._updatedAt || !privateSecret?.secret ? { isValid: false, studioUrl: null } : { isValid: secret === privateSecret.secret, studioUrl: privateSecret.studioUrl } : publicSecret?.secret ? { isValid: secret === publicSecret.secret, studioUrl: publicSecret.studioUrl } : { isValid: false, studioUrl: null };
}
async function validatePreviewUrl(_client, previewUrl, disableCacheNoStore = globalThis.navigator?.userAgent === "Cloudflare-Workers") {
  const client2 = createClientWithConfig(_client);
  let parsedPreviewUrl;
  try {
    parsedPreviewUrl = parsePreviewUrl(previewUrl);
  } catch (error2) {
    return isDev && console.error("Failed to parse preview URL", error2, {
      previewUrl,
      client: client2
    }), { isValid: false };
  }
  const { isValid, studioUrl } = await validateSecret(
    client2,
    parsedPreviewUrl.secret,
    disableCacheNoStore
  ), redirectTo = isValid ? parsedPreviewUrl.redirectTo : void 0, studioPreviewPerspective = isValid ? parsedPreviewUrl.studioPreviewPerspective : void 0;
  let studioOrigin;
  if (isValid)
    try {
      studioOrigin = new URL(studioUrl).origin;
    } catch (error2) {
      isDev && console.error("Failed to parse studioUrl", error2, {
        previewUrl,
        studioUrl
      });
    }
  return { isValid, redirectTo, studioOrigin, studioPreviewPerspective };
}
const handlePreview = ({ client: client2, preview }) => {
  const cookieName = preview?.cookie || "__sanity_preview";
  const enablePath = preview?.endpoints?.enable || "/preview/enable";
  const disablePath = preview?.endpoints?.disable || "/preview/disable";
  const secret = preview?.secret || crypto.randomBytes(16).toString("hex");
  if (!client2)
    throw new Error("No client configured for preview");
  return async ({ event, resolve }) => {
    const { cookies, url } = event;
    event.locals.preview = event.cookies.get(cookieName) === secret;
    const perspective = event.locals.preview ? "previewDrafts" : "published";
    const useCdn = event.locals.preview ? false : true;
    if (event.url.pathname === enablePath) {
      const { isValid, redirectTo = "/" } = await validatePreviewUrl(client2, url.toString());
      if (!isValid) {
        throw error(401, "Invalid secret");
      }
      const devMode = process.env.NODE_ENV === "development";
      cookies.set(cookieName, secret, {
        httpOnly: true,
        sameSite: devMode ? "lax" : "none",
        secure: !devMode,
        path: "/"
      });
      return redirect(307, redirectTo);
    }
    if (event.url.pathname === disablePath) {
      cookies.delete(cookieName, { path: "/" });
      return redirect(307, url.searchParams.get("redirect") || "/");
    }
    event.locals.client = client2.withConfig({
      perspective,
      useCdn
    });
    return await resolve(event);
  };
};
var cache = {}, symbol, hasRequiredSymbol;
function requireSymbol() {
  if (hasRequiredSymbol) return symbol;
  hasRequiredSymbol = 1;
  const kValues = Symbol("values"), kStorage = Symbol("kStorage"), kStorages = Symbol("kStorages"), kTransfromer = Symbol("kTransformer"), kTTL = Symbol("kTTL"), kOnDedupe = Symbol("kOnDedupe"), kOnError = Symbol("kOnError"), kOnHit = Symbol("kOnHit"), kOnMiss = Symbol("kOnMiss"), kStale = Symbol("kStale");
  return symbol = { kValues, kStorage, kStorages, kTransfromer, kTTL, kOnDedupe, kOnError, kOnHit, kOnMiss, kStale }, symbol;
}
var safeStableStringify = { exports: {} }, hasRequiredSafeStableStringify;
function requireSafeStableStringify() {
  return hasRequiredSafeStableStringify || (hasRequiredSafeStableStringify = 1, function(module, exports) {
    const { hasOwnProperty } = Object.prototype, stringify = configure();
    stringify.configure = configure, stringify.stringify = stringify, stringify.default = stringify, exports.stringify = stringify, exports.configure = configure, module.exports = stringify;
    const strEscapeSequencesRegExp = /[\u0000-\u001f\u0022\u005c\ud800-\udfff]|[\ud800-\udbff](?![\udc00-\udfff])|(?:[^\ud800-\udbff]|^)[\udc00-\udfff]/;
    function strEscape(str) {
      return str.length < 5e3 && !strEscapeSequencesRegExp.test(str) ? `"${str}"` : JSON.stringify(str);
    }
    function insertSort(array) {
      if (array.length > 200)
        return array.sort();
      for (let i = 1; i < array.length; i++) {
        const currentValue = array[i];
        let position = i;
        for (; position !== 0 && array[position - 1] > currentValue; )
          array[position] = array[position - 1], position--;
        array[position] = currentValue;
      }
      return array;
    }
    const typedArrayPrototypeGetSymbolToStringTag = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(
        Object.getPrototypeOf(
          new Int8Array()
        )
      ),
      Symbol.toStringTag
    ).get;
    function isTypedArrayWithEntries(value) {
      return typedArrayPrototypeGetSymbolToStringTag.call(value) !== void 0 && value.length !== 0;
    }
    function stringifyTypedArray(array, separator, maximumBreadth) {
      array.length < maximumBreadth && (maximumBreadth = array.length);
      const whitespace = separator === "," ? "" : " ";
      let res = `"0":${whitespace}${array[0]}`;
      for (let i = 1; i < maximumBreadth; i++)
        res += `${separator}"${i}":${whitespace}${array[i]}`;
      return res;
    }
    function getCircularValueOption(options) {
      if (hasOwnProperty.call(options, "circularValue")) {
        const circularValue = options.circularValue;
        if (typeof circularValue == "string")
          return `"${circularValue}"`;
        if (circularValue == null)
          return circularValue;
        if (circularValue === Error || circularValue === TypeError)
          return {
            toString() {
              throw new TypeError("Converting circular structure to JSON");
            }
          };
        throw new TypeError('The "circularValue" argument must be of type string or the value null or undefined');
      }
      return '"[Circular]"';
    }
    function getBooleanOption(options, key) {
      let value;
      if (hasOwnProperty.call(options, key) && (value = options[key], typeof value != "boolean"))
        throw new TypeError(`The "${key}" argument must be of type boolean`);
      return value === void 0 ? true : value;
    }
    function getPositiveIntegerOption(options, key) {
      let value;
      if (hasOwnProperty.call(options, key)) {
        if (value = options[key], typeof value != "number")
          throw new TypeError(`The "${key}" argument must be of type number`);
        if (!Number.isInteger(value))
          throw new TypeError(`The "${key}" argument must be an integer`);
        if (value < 1)
          throw new RangeError(`The "${key}" argument must be >= 1`);
      }
      return value === void 0 ? 1 / 0 : value;
    }
    function getItemCount(number) {
      return number === 1 ? "1 item" : `${number} items`;
    }
    function getUniqueReplacerSet(replacerArray) {
      const replacerSet = /* @__PURE__ */ new Set();
      for (const value of replacerArray)
        (typeof value == "string" || typeof value == "number") && replacerSet.add(String(value));
      return replacerSet;
    }
    function getStrictOption(options) {
      if (hasOwnProperty.call(options, "strict")) {
        const value = options.strict;
        if (typeof value != "boolean")
          throw new TypeError('The "strict" argument must be of type boolean');
        if (value)
          return (value2) => {
            let message = `Object can not safely be stringified. Received type ${typeof value2}`;
            throw typeof value2 != "function" && (message += ` (${value2.toString()})`), new Error(message);
          };
      }
    }
    function configure(options) {
      options = { ...options };
      const fail = getStrictOption(options);
      fail && (options.bigint === void 0 && (options.bigint = false), "circularValue" in options || (options.circularValue = Error));
      const circularValue = getCircularValueOption(options), bigint = getBooleanOption(options, "bigint"), deterministic = getBooleanOption(options, "deterministic"), maximumDepth = getPositiveIntegerOption(options, "maximumDepth"), maximumBreadth = getPositiveIntegerOption(options, "maximumBreadth");
      function stringifyFnReplacer(key, parent, stack, replacer, spacer, indentation) {
        let value = parent[key];
        switch (typeof value == "object" && value !== null && typeof value.toJSON == "function" && (value = value.toJSON(key)), value = replacer.call(parent, key, value), typeof value) {
          case "string":
            return strEscape(value);
          case "object": {
            if (value === null)
              return "null";
            if (stack.indexOf(value) !== -1)
              return circularValue;
            let res = "", join = ",";
            const originalIndentation = indentation;
            if (Array.isArray(value)) {
              if (value.length === 0)
                return "[]";
              if (maximumDepth < stack.length + 1)
                return '"[Array]"';
              stack.push(value), spacer !== "" && (indentation += spacer, res += `
${indentation}`, join = `,
${indentation}`);
              const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
              let i = 0;
              for (; i < maximumValuesToStringify - 1; i++) {
                const tmp2 = stringifyFnReplacer(String(i), value, stack, replacer, spacer, indentation);
                res += tmp2 !== void 0 ? tmp2 : "null", res += join;
              }
              const tmp = stringifyFnReplacer(String(i), value, stack, replacer, spacer, indentation);
              if (res += tmp !== void 0 ? tmp : "null", value.length - 1 > maximumBreadth) {
                const removedKeys = value.length - maximumBreadth - 1;
                res += `${join}"... ${getItemCount(removedKeys)} not stringified"`;
              }
              return spacer !== "" && (res += `
${originalIndentation}`), stack.pop(), `[${res}]`;
            }
            let keys = Object.keys(value);
            const keyLength = keys.length;
            if (keyLength === 0)
              return "{}";
            if (maximumDepth < stack.length + 1)
              return '"[Object]"';
            let whitespace = "", separator = "";
            spacer !== "" && (indentation += spacer, join = `,
${indentation}`, whitespace = " ");
            const maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
            deterministic && !isTypedArrayWithEntries(value) && (keys = insertSort(keys)), stack.push(value);
            for (let i = 0; i < maximumPropertiesToStringify; i++) {
              const key2 = keys[i], tmp = stringifyFnReplacer(key2, value, stack, replacer, spacer, indentation);
              tmp !== void 0 && (res += `${separator}${strEscape(key2)}:${whitespace}${tmp}`, separator = join);
            }
            if (keyLength > maximumBreadth) {
              const removedKeys = keyLength - maximumBreadth;
              res += `${separator}"...":${whitespace}"${getItemCount(removedKeys)} not stringified"`, separator = join;
            }
            return spacer !== "" && separator.length > 1 && (res = `
${indentation}${res}
${originalIndentation}`), stack.pop(), `{${res}}`;
          }
          case "number":
            return isFinite(value) ? String(value) : fail ? fail(value) : "null";
          case "boolean":
            return value === true ? "true" : "false";
          case "undefined":
            return;
          case "bigint":
            if (bigint)
              return String(value);
          default:
            return fail ? fail(value) : void 0;
        }
      }
      function stringifyArrayReplacer(key, value, stack, replacer, spacer, indentation) {
        switch (typeof value == "object" && value !== null && typeof value.toJSON == "function" && (value = value.toJSON(key)), typeof value) {
          case "string":
            return strEscape(value);
          case "object": {
            if (value === null)
              return "null";
            if (stack.indexOf(value) !== -1)
              return circularValue;
            const originalIndentation = indentation;
            let res = "", join = ",";
            if (Array.isArray(value)) {
              if (value.length === 0)
                return "[]";
              if (maximumDepth < stack.length + 1)
                return '"[Array]"';
              stack.push(value), spacer !== "" && (indentation += spacer, res += `
${indentation}`, join = `,
${indentation}`);
              const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
              let i = 0;
              for (; i < maximumValuesToStringify - 1; i++) {
                const tmp2 = stringifyArrayReplacer(String(i), value[i], stack, replacer, spacer, indentation);
                res += tmp2 !== void 0 ? tmp2 : "null", res += join;
              }
              const tmp = stringifyArrayReplacer(String(i), value[i], stack, replacer, spacer, indentation);
              if (res += tmp !== void 0 ? tmp : "null", value.length - 1 > maximumBreadth) {
                const removedKeys = value.length - maximumBreadth - 1;
                res += `${join}"... ${getItemCount(removedKeys)} not stringified"`;
              }
              return spacer !== "" && (res += `
${originalIndentation}`), stack.pop(), `[${res}]`;
            }
            stack.push(value);
            let whitespace = "";
            spacer !== "" && (indentation += spacer, join = `,
${indentation}`, whitespace = " ");
            let separator = "";
            for (const key2 of replacer) {
              const tmp = stringifyArrayReplacer(key2, value[key2], stack, replacer, spacer, indentation);
              tmp !== void 0 && (res += `${separator}${strEscape(key2)}:${whitespace}${tmp}`, separator = join);
            }
            return spacer !== "" && separator.length > 1 && (res = `
${indentation}${res}
${originalIndentation}`), stack.pop(), `{${res}}`;
          }
          case "number":
            return isFinite(value) ? String(value) : fail ? fail(value) : "null";
          case "boolean":
            return value === true ? "true" : "false";
          case "undefined":
            return;
          case "bigint":
            if (bigint)
              return String(value);
          default:
            return fail ? fail(value) : void 0;
        }
      }
      function stringifyIndent(key, value, stack, spacer, indentation) {
        switch (typeof value) {
          case "string":
            return strEscape(value);
          case "object": {
            if (value === null)
              return "null";
            if (typeof value.toJSON == "function") {
              if (value = value.toJSON(key), typeof value != "object")
                return stringifyIndent(key, value, stack, spacer, indentation);
              if (value === null)
                return "null";
            }
            if (stack.indexOf(value) !== -1)
              return circularValue;
            const originalIndentation = indentation;
            if (Array.isArray(value)) {
              if (value.length === 0)
                return "[]";
              if (maximumDepth < stack.length + 1)
                return '"[Array]"';
              stack.push(value), indentation += spacer;
              let res2 = `
${indentation}`;
              const join2 = `,
${indentation}`, maximumValuesToStringify = Math.min(value.length, maximumBreadth);
              let i = 0;
              for (; i < maximumValuesToStringify - 1; i++) {
                const tmp2 = stringifyIndent(String(i), value[i], stack, spacer, indentation);
                res2 += tmp2 !== void 0 ? tmp2 : "null", res2 += join2;
              }
              const tmp = stringifyIndent(String(i), value[i], stack, spacer, indentation);
              if (res2 += tmp !== void 0 ? tmp : "null", value.length - 1 > maximumBreadth) {
                const removedKeys = value.length - maximumBreadth - 1;
                res2 += `${join2}"... ${getItemCount(removedKeys)} not stringified"`;
              }
              return res2 += `
${originalIndentation}`, stack.pop(), `[${res2}]`;
            }
            let keys = Object.keys(value);
            const keyLength = keys.length;
            if (keyLength === 0)
              return "{}";
            if (maximumDepth < stack.length + 1)
              return '"[Object]"';
            indentation += spacer;
            const join = `,
${indentation}`;
            let res = "", separator = "", maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
            isTypedArrayWithEntries(value) && (res += stringifyTypedArray(value, join, maximumBreadth), keys = keys.slice(value.length), maximumPropertiesToStringify -= value.length, separator = join), deterministic && (keys = insertSort(keys)), stack.push(value);
            for (let i = 0; i < maximumPropertiesToStringify; i++) {
              const key2 = keys[i], tmp = stringifyIndent(key2, value[key2], stack, spacer, indentation);
              tmp !== void 0 && (res += `${separator}${strEscape(key2)}: ${tmp}`, separator = join);
            }
            if (keyLength > maximumBreadth) {
              const removedKeys = keyLength - maximumBreadth;
              res += `${separator}"...": "${getItemCount(removedKeys)} not stringified"`, separator = join;
            }
            return separator !== "" && (res = `
${indentation}${res}
${originalIndentation}`), stack.pop(), `{${res}}`;
          }
          case "number":
            return isFinite(value) ? String(value) : fail ? fail(value) : "null";
          case "boolean":
            return value === true ? "true" : "false";
          case "undefined":
            return;
          case "bigint":
            if (bigint)
              return String(value);
          default:
            return fail ? fail(value) : void 0;
        }
      }
      function stringifySimple(key, value, stack) {
        switch (typeof value) {
          case "string":
            return strEscape(value);
          case "object": {
            if (value === null)
              return "null";
            if (typeof value.toJSON == "function") {
              if (value = value.toJSON(key), typeof value != "object")
                return stringifySimple(key, value, stack);
              if (value === null)
                return "null";
            }
            if (stack.indexOf(value) !== -1)
              return circularValue;
            let res = "";
            if (Array.isArray(value)) {
              if (value.length === 0)
                return "[]";
              if (maximumDepth < stack.length + 1)
                return '"[Array]"';
              stack.push(value);
              const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
              let i = 0;
              for (; i < maximumValuesToStringify - 1; i++) {
                const tmp2 = stringifySimple(String(i), value[i], stack);
                res += tmp2 !== void 0 ? tmp2 : "null", res += ",";
              }
              const tmp = stringifySimple(String(i), value[i], stack);
              if (res += tmp !== void 0 ? tmp : "null", value.length - 1 > maximumBreadth) {
                const removedKeys = value.length - maximumBreadth - 1;
                res += `,"... ${getItemCount(removedKeys)} not stringified"`;
              }
              return stack.pop(), `[${res}]`;
            }
            let keys = Object.keys(value);
            const keyLength = keys.length;
            if (keyLength === 0)
              return "{}";
            if (maximumDepth < stack.length + 1)
              return '"[Object]"';
            let separator = "", maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
            isTypedArrayWithEntries(value) && (res += stringifyTypedArray(value, ",", maximumBreadth), keys = keys.slice(value.length), maximumPropertiesToStringify -= value.length, separator = ","), deterministic && (keys = insertSort(keys)), stack.push(value);
            for (let i = 0; i < maximumPropertiesToStringify; i++) {
              const key2 = keys[i], tmp = stringifySimple(key2, value[key2], stack);
              tmp !== void 0 && (res += `${separator}${strEscape(key2)}:${tmp}`, separator = ",");
            }
            if (keyLength > maximumBreadth) {
              const removedKeys = keyLength - maximumBreadth;
              res += `${separator}"...":"${getItemCount(removedKeys)} not stringified"`;
            }
            return stack.pop(), `{${res}}`;
          }
          case "number":
            return isFinite(value) ? String(value) : fail ? fail(value) : "null";
          case "boolean":
            return value === true ? "true" : "false";
          case "undefined":
            return;
          case "bigint":
            if (bigint)
              return String(value);
          default:
            return fail ? fail(value) : void 0;
        }
      }
      function stringify2(value, replacer, space) {
        if (arguments.length > 1) {
          let spacer = "";
          if (typeof space == "number" ? spacer = " ".repeat(Math.min(space, 10)) : typeof space == "string" && (spacer = space.slice(0, 10)), replacer != null) {
            if (typeof replacer == "function")
              return stringifyFnReplacer("", { "": value }, [], replacer, spacer, "");
            if (Array.isArray(replacer))
              return stringifyArrayReplacer("", value, [], getUniqueReplacerSet(replacer), spacer, "");
          }
          if (spacer.length !== 0)
            return stringifyIndent("", value, [], spacer, "");
        }
        return stringifySimple("", value, []);
      }
      return stringify2;
    }
  }(safeStableStringify, safeStableStringify.exports)), safeStableStringify.exports;
}
var util, hasRequiredUtil;
function requireUtil() {
  if (hasRequiredUtil) return util;
  hasRequiredUtil = 1;
  function findMatchingIndexes(arrayA, arrayB) {
    const found = [];
    let lastIndexB = 0;
    for (let indexA = 0; indexA < arrayA.length; indexA++)
      for (let indexB = lastIndexB; indexB < arrayB.length; indexB++)
        arrayA[indexA] === arrayB[indexB] && (found.push(indexB), lastIndexB = indexB + 1);
    return found;
  }
  function findNotMatching(arrayA, arrayB) {
    const found = [];
    let lastIndexB = 0;
    for (let indexA = 0; indexA < arrayA.length; indexA++)
      for (let indexB = lastIndexB; indexB < arrayB.length; indexB++)
        arrayA[indexA] !== arrayB[indexB] && (found.push(arrayB[indexB]), lastIndexB = indexB + 1);
    return found;
  }
  function bsearchIndex(array, value) {
    let start = 0, end = array.length - 1;
    for (; start <= end; ) {
      const index = (start + end) / 2 | 0;
      if (array[index] === value)
        return index;
      array[index] < value ? start = index + 1 : end = index - 1;
    }
    return -1;
  }
  function randomNumber(max) {
    return max * Math.random() | 0;
  }
  function randomInRange(min, max) {
    return min = Math.floor(min), max = Math.floor(max), min + randomNumber(1 + max - min);
  }
  function randomSubset(array, size) {
    if (array.length < 1 || size < 1) return [];
    const limit = Math.min(array.length, size), n = randomInRange(1, limit), indexes = /* @__PURE__ */ new Set();
    for (let i = 0; i < n; i++)
      indexes.add(randomNumber(array.length));
    const result = [];
    for (const i of indexes)
      result.push(array[i]);
    return result;
  }
  function wildcardMatch(value, content) {
    if (value === "*" || value.length === content.length && value === content) return true;
    let i = 0, j = 0;
    for (; i < value.length && j < content.length; ) {
      if (value[i] === content[j]) {
        i++, j++;
        continue;
      }
      if (value[i] === "*") {
        if (value[i + 1] === content[j]) {
          i++;
          continue;
        }
        j++;
        continue;
      }
      return false;
    }
    return i >= value.length - 1;
  }
  function abstractLogging() {
    const noop = () => {
    };
    return {
      fatal: noop,
      error: noop,
      warn: noop,
      info: noop,
      debug: noop,
      trace: noop
    };
  }
  return util = {
    findNotMatching,
    findMatchingIndexes,
    bsearchIndex,
    wildcardMatch,
    randomSubset,
    abstractLogging,
    isServerSide: typeof window > "u"
  }, util;
}
var _interface, hasRequired_interface;
function require_interface() {
  if (hasRequired_interface) return _interface;
  hasRequired_interface = 1;
  class StorageInterface {
    constructor(options) {
      this.options = options;
    }
    /**
     * @param {string} key
     * @returns {undefined|*} undefined if key not found
     */
    async get(key) {
      throw new Error("storage get method not implemented");
    }
    /**
     * @param {string} key
     * @param {*} value
     * @param {number} ttl - ttl in seconds; zero means key will not be stored
     * @param {?string[]} references
     */
    async set(key, value, ttl, references) {
      throw new Error("storage set method not implemented");
    }
    /**
     * @param {string} key
     */
    async remove(key) {
      throw new Error("storage remove method not implemented");
    }
    /**
     * @param {string[]} references
     */
    async invalidate(references) {
      throw new Error("storage invalidate method not implemented");
    }
    /**
     * @param {string} name
     */
    async clear(name) {
      throw new Error("storage clear method not implemented");
    }
    async refresh() {
      throw new Error("storage refresh method not implemented");
    }
  }
  return _interface = StorageInterface, _interface;
}
var redis, hasRequiredRedis;
function requireRedis() {
  if (hasRequiredRedis) return redis;
  hasRequiredRedis = 1;
  const stringify = requireSafeStableStringify(), StorageInterface = require_interface(), { findNotMatching, randomSubset, abstractLogging } = requireUtil(), GC_DEFAULT_CHUNK = 64, GC_DEFAULT_LAZY_CHUNK = 64, REFERENCES_DEFAULT_TTL = 60;
  class StorageRedis extends StorageInterface {
    /**
     * @param {?StorageRedisOptions} options
     */
    constructor(options = {}) {
      if (!options.client || typeof options.client != "object")
        throw new Error("Redis client is required");
      if (super(options), options.invalidation && options.invalidation.referencesTTL && (typeof options.invalidation.referencesTTL != "number" || options.invalidation.referencesTTL < 1))
        throw new Error("invalidation.referencesTTL must be a positive integer greater than 1");
      this.log = options.log || abstractLogging(), this.store = options.client, this.invalidation = !!options.invalidation, this.referencesTTL = options.invalidation && options.invalidation.referencesTTL || REFERENCES_DEFAULT_TTL;
    }
    getReferenceKeyLabel(reference) {
      return `r:${reference}`;
    }
    getKeyReferenceLabel(key) {
      return `k:${key}`;
    }
    /**
     * @param {string} key
     * @returns {undefined|*} undefined if key not found
     */
    async get(key) {
      this.log.debug({ msg: "acd/storage/redis.get", key });
      try {
        const value = await this.store.get(key);
        if (!value) {
          if (!this.invalidation)
            return;
          this.clearReferences(key);
          return;
        }
        return JSON.parse(value);
      } catch (err) {
        this.log.error({ msg: "acd/storage/redis.get error", err, key });
      }
    }
    /**
     * retrieve the remaining TTL value by key
     * @param {string} key
     * @returns {undefined|*} undefined if key not found or expired
     */
    async getTTL(key) {
      this.log.debug({ msg: "acd/storage/memory.getTTL", key });
      let pttl = await this.store.pttl(key);
      return pttl < 0 ? 0 : (pttl = Math.ceil(pttl / 1e3), pttl);
    }
    /**
     * set value by key
     * @param {string} key
     * @param {*} value
     * @param {number} ttl - ttl in seconds; zero means key will not be stored
     * @param {?string[]} references
     */
    async set(key, value, ttl, references) {
      if (this.log.debug({ msg: "acd/storage/redis.set key", key, value, ttl, references }), ttl = Number(ttl), !(!ttl || ttl < 0))
        try {
          if (await this.store.set(key, stringify(value), "EX", ttl), !references || references.length < 1)
            return;
          if (!this.invalidation) {
            this.log.warn({ msg: "acd/storage/redis.set, invalidation is disabled, references are useless", key, references });
            return;
          }
          const writes = [], currentReferences = await this.store.smembers(this.getKeyReferenceLabel(key));
          if (this.log.debug({ msg: "acd/storage/redis.set current references", key, currentReferences }), currentReferences.length > 1) {
            currentReferences.sort(), references.sort();
            const referencesToRemove = findNotMatching(references, currentReferences);
            for (const reference of referencesToRemove)
              writes.push(["srem", this.getReferenceKeyLabel(reference), key]);
            writes.push(["del", this.getKeyReferenceLabel(key)]);
          }
          const referencesToAdd = currentReferences.length > 1 ? findNotMatching(currentReferences, references) : references;
          this.log.debug({ msg: "acd/storage/redis.set references to add", key, referencesToAdd });
          for (let i = 0; i < referencesToAdd.length; i++) {
            const reference = referencesToAdd[i], referenceKeyLabel = this.getReferenceKeyLabel(reference);
            writes.push(["sadd", referenceKeyLabel, key]), writes.push(["expire", referenceKeyLabel, this.referencesTTL]);
          }
          const keyReferenceLabel = this.getKeyReferenceLabel(key);
          writes.push(["sadd", keyReferenceLabel, references]), writes.push(["expire", keyReferenceLabel, ttl]), this.log.debug({ msg: "acd/storage/redis.set references writes", writes }), await this.store.pipeline(writes).exec();
        } catch (err) {
          this.log.error({ msg: "acd/storage/redis.set error", err, key, ttl, references });
        }
    }
    /**
     * remove an entry by key
     * @param {string} key
     * @returns {boolean} indicates if key was removed
     */
    async remove(key) {
      this.log.debug({ msg: "acd/storage/redis.remove", key });
      try {
        const removed = await this.store.del(key) > 0;
        return removed && this.invalidation && await this.clearReferences(key), removed;
      } catch (err) {
        this.log.error({ msg: "acd/storage/redis.remove error", err, key });
      }
    }
    /**
     * @param {string|string[]} references
     * @returns {string[]} removed keys
     */
    async invalidate(references) {
      if (!this.invalidation)
        return this.log.warn({ msg: "acd/storage/redis.invalidate, exit due invalidation is disabled" }), [];
      this.log.debug({ msg: "acd/storage/redis.invalidate", references });
      try {
        return Array.isArray(references) ? await this._invalidateReferences(references) : await this._invalidateReference(references);
      } catch (err) {
        return this.log.error({ msg: "acd/storage/redis.invalidate error", err, references }), [];
      }
    }
    /**
     * @param {string[]} references
     * @param {[bool=true]} mapReferences
     * @returns {string[]} removed keys
     */
    async _invalidateReferences(references, mapReferences = true) {
      const reads = references.map((reference) => ["smembers", mapReferences ? this.getReferenceKeyLabel(reference) : reference]), keys = await this.store.pipeline(reads).exec();
      this.log.debug({ msg: "acd/storage/redis._invalidateReferences keys", keys });
      const writes = [], removed = [];
      for (let i = 0; i < keys.length; i++) {
        const key0 = keys[i][1];
        if (key0) {
          this.log.debug({ msg: "acd/storage/redis._invalidateReferences got keys to be invalidated", keys: key0 });
          for (let j = 0; j < key0.length; j++) {
            const key1 = key0[j];
            this.log.debug({ msg: "acd/storage/redis._invalidateReferences del key" + key1 }), removed.push(key1), writes.push(["del", key1]);
          }
        }
      }
      return await this.store.pipeline(writes).exec(), await this.clearReferences(removed), removed;
    }
    /**
     * @param {string} reference
     * @returns {string[]} removed keys
     */
    async _invalidateReference(reference) {
      let keys;
      if (reference.includes("*")) {
        const references = await this.store.keys(this.getReferenceKeyLabel(reference));
        return this._invalidateReferences(references, false);
      } else
        keys = await this.store.smembers(this.getReferenceKeyLabel(reference));
      this.log.debug({ msg: "acd/storage/redis._invalidateReference keys", keys });
      const writes = [], removed = [];
      for (let i = 0; i < keys.length; i++) {
        const key0 = keys[i];
        this.log.debug({ msg: "acd/storage/redis._invalidateReference del key" + key0 }), removed.push(key0), writes.push(["del", key0]);
      }
      return await this.store.pipeline(writes).exec(), await this.clearReferences(removed), removed;
    }
    /**
     * @param {string} name
     */
    async clear(name) {
      this.log.debug({ msg: "acd/storage/redis.clear", name });
      try {
        if (!name) {
          await this.store.flushall();
          return;
        }
        const keys = await this.store.keys(`${name}*`);
        this.log.debug({ msg: "acd/storage/redis.clear keys", keys });
        const removes = keys.map((key) => ["del", key]);
        if (await this.store.pipeline(removes).exec(), !this.invalidation)
          return;
        await this.clearReferences(keys);
      } catch (err) {
        this.log.error({ msg: "acd/storage/redis.clear error", err, name });
      }
    }
    async refresh() {
      try {
        await this.store.flushall();
      } catch (err) {
        this.log.error({ msg: "acd/storage/redis.refresh error", err });
      }
    }
    /**
     * note: does not throw on error
     * @param {string|string[]} keys
     */
    async clearReferences(keys) {
      try {
        if (!keys) {
          this.log.warn({ msg: "acd/storage/redis.clearReferences invalid call due to empty key" });
          return;
        }
        Array.isArray(keys) || (keys = [keys]);
        const reads = keys.map((key) => ["smembers", this.getKeyReferenceLabel(key)]), referencesKeys = await this.store.pipeline(reads).exec();
        this.log.debug({ msg: "acd/storage/redis.clearReferences references", keys, referencesKeys });
        const writes = {};
        for (let i = 0; i < keys.length; i++) {
          for (let j = 0; j < referencesKeys[i][1].length; j++) {
            const reference = this.getReferenceKeyLabel(referencesKeys[i][1][j]);
            writes[reference] || (writes[reference] = ["srem", reference, keys]);
          }
          const key = this.getKeyReferenceLabel(keys[i]);
          writes[key] = ["del", key];
        }
        this.log.debug({ msg: "acd/storage/redis.clearReferences writes pipeline", writes }), await this.store.pipeline(Object.values(writes)).exec();
      } catch (err) {
        this.log.error({ msg: "acd/storage/redis.clearReferences error", err });
      }
    }
    /**
     * scan references and clean expired/evicted keys
     * @param {?string} [mode=lazy] lazy or strict
     * - in lazy mode, only `options.max` references are scanned every time, picking keys to check randomly
     *   so this operation is lighter while does not ensure references full clean up
     * - in strict mode, all references and keys are checked
     *   this operation scan the whole db and is slow
     * @param {?object} options
     * @param {number} [options.chunk=64] number of references to retrieve at once
     * @param {number|undefined} [options.lazy.cursor] cursor to start the scan; should be last cursor returned by scan; default start from the beginning
     * @param {number} [lazyChunk=64] number of references to check per gc cycle
     * @return {Object} report information of the operation
     *   references scanned/removed, keys scanned/removed, loops, cursor, error if any
     */
    async gc(mode = "lazy", options = {}) {
      if (this.log.debug({ msg: "acd/storage/redis.gc", mode, options }), !this.invalidation) {
        this.log.warn({ msg: "acd/storage/redis.gc does not run due to invalidation is disabled" });
        return;
      }
      mode !== "strict" && mode !== "lazy" && (mode = "lazy");
      const report = {
        references: { scanned: [], removed: [] },
        keys: { scanned: /* @__PURE__ */ new Set(), removed: /* @__PURE__ */ new Set() },
        loops: 0,
        cursor: 0,
        error: null
      };
      try {
        let cursor = 0, lazyChunk = GC_DEFAULT_LAZY_CHUNK;
        if (options.chunk && (typeof options.chunk != "number" || options.chunk < 1))
          return report.error = new Error("chunk must be a positive integer greater than 1"), report;
        if (options.lazy) {
          if (options.lazy.chunk) {
            if (typeof options.lazy.chunk != "number" || options.lazy.chunk < 1)
              return report.error = new Error("lazy.chunk must be a positive integer greater than 1"), report;
            lazyChunk = options.lazy.chunk;
          }
          if (options.lazy.cursor) {
            if (typeof options.lazy.cursor != "number" || options.lazy.cursor < 0)
              return report.error = new Error("lazy.cursor must be a positive integer greater than 0"), report;
            cursor = options.lazy.cursor;
          }
        }
        const chunk = options.chunk || GC_DEFAULT_CHUNK, scanCount = Math.min(lazyChunk, chunk), startingCursor = cursor;
        let lastScanLength = -1, lastRemoved = -1;
        do {
          report.loops++;
          const scan = await this.store.scan(cursor, "match", "r:*", "count", scanCount);
          cursor = Number(scan[0]), lastScanLength = scan[1].length;
          const references = mode === "lazy" ? randomSubset(scan[1], lazyChunk) : scan[1];
          report.references.scanned = report.references.scanned.concat(references);
          let reads = [];
          for (let i = 0; i < references.length; i++) {
            const reference = references[i];
            reads.push(["smembers", reference]);
          }
          const referencesKeys = await this.store.pipeline(reads).exec(), keysMap = {}, referencesKeysMap = {};
          for (let i = 0; i < referencesKeys.length; i++) {
            const keys2 = referencesKeys[i], reference = references[i];
            referencesKeysMap[reference] = keys2[1];
            for (let j = 0; j < keys2[1].length; j++) {
              const key = keys2[1][j];
              keysMap[key] ? keysMap[key].push(reference) : keysMap[key] = [reference], report.keys.scanned.add(key);
            }
          }
          const keys = Object.keys(keysMap);
          reads = keys.map((key) => ["exists", key]);
          const existingKeys = await this.store.pipeline(reads).exec(), removingKeys = {};
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (existingKeys[i][1] !== 1)
              for (let j = 0; j < keysMap[key].length; j++) {
                const reference = keysMap[key][j];
                removingKeys[reference] ? removingKeys[reference].push(key) : removingKeys[reference] = [key], report.keys.removed.add(key);
              }
          }
          const writeReferences = Object.keys(removingKeys), writes = [];
          for (let i = 0; i < writeReferences.length; i++) {
            const reference = writeReferences[i];
            referencesKeysMap[reference].length === removingKeys[reference].length ? (writes.push(["del", reference]), report.references.removed.push(reference)) : writes.push(["srem", reference, removingKeys[reference]]);
          }
          if (await this.store.pipeline(writes).exec(), lastRemoved = writes.length, mode === "lazy" && report.references.scanned.length >= lazyChunk)
            break;
        } while (startingCursor !== cursor && lastScanLength > 0 && lastRemoved > 0);
        report.cursor = cursor, report.keys.scanned = Array.from(report.keys.scanned), report.keys.removed = Array.from(report.keys.removed);
      } catch (err) {
        this.log.error({ msg: "acd/storage/redis.gc error", err }), report.error = err;
      }
      return report;
    }
  }
  return redis = StorageRedis, redis;
}
var iterator, hasRequiredIterator;
function requireIterator() {
  if (hasRequiredIterator) return iterator;
  hasRequiredIterator = 1;
  function Iterator(next) {
    if (typeof next != "function")
      throw new Error("obliterator/iterator: expecting a function!");
    this.next = next;
  }
  return typeof Symbol < "u" && (Iterator.prototype[Symbol.iterator] = function() {
    return this;
  }), Iterator.of = function() {
    var args = arguments, l = args.length, i = 0;
    return new Iterator(function() {
      return i >= l ? { done: true } : { done: false, value: args[i++] };
    });
  }, Iterator.empty = function() {
    var iterator2 = new Iterator(function() {
      return { done: true };
    });
    return iterator2;
  }, Iterator.fromSequence = function(sequence2) {
    var i = 0, l = sequence2.length;
    return new Iterator(function() {
      return i >= l ? { done: true } : { done: false, value: sequence2[i++] };
    });
  }, Iterator.is = function(value) {
    return value instanceof Iterator ? true : typeof value == "object" && value !== null && typeof value.next == "function";
  }, iterator = Iterator, iterator;
}
var support = {}, hasRequiredSupport;
function requireSupport() {
  return hasRequiredSupport || (hasRequiredSupport = 1, support.ARRAY_BUFFER_SUPPORT = typeof ArrayBuffer < "u", support.SYMBOL_SUPPORT = typeof Symbol < "u"), support;
}
var foreach, hasRequiredForeach;
function requireForeach() {
  if (hasRequiredForeach) return foreach;
  hasRequiredForeach = 1;
  var support2 = requireSupport(), ARRAY_BUFFER_SUPPORT = support2.ARRAY_BUFFER_SUPPORT, SYMBOL_SUPPORT = support2.SYMBOL_SUPPORT;
  return foreach = function(iterable, callback) {
    var iterator2, k, i, l, s;
    if (!iterable) throw new Error("obliterator/forEach: invalid iterable.");
    if (typeof callback != "function")
      throw new Error("obliterator/forEach: expecting a callback.");
    if (Array.isArray(iterable) || ARRAY_BUFFER_SUPPORT && ArrayBuffer.isView(iterable) || typeof iterable == "string" || iterable.toString() === "[object Arguments]") {
      for (i = 0, l = iterable.length; i < l; i++) callback(iterable[i], i);
      return;
    }
    if (typeof iterable.forEach == "function") {
      iterable.forEach(callback);
      return;
    }
    if (SYMBOL_SUPPORT && Symbol.iterator in iterable && typeof iterable.next != "function" && (iterable = iterable[Symbol.iterator]()), typeof iterable.next == "function") {
      for (iterator2 = iterable, i = 0; s = iterator2.next(), s.done !== true; )
        callback(s.value, i), i++;
      return;
    }
    for (k in iterable)
      iterable.hasOwnProperty(k) && callback(iterable[k], k);
  }, foreach;
}
var typedArrays = {}, hasRequiredTypedArrays;
function requireTypedArrays() {
  return hasRequiredTypedArrays || (hasRequiredTypedArrays = 1, function(exports) {
    var MAX_8BIT_INTEGER = Math.pow(2, 8) - 1, MAX_16BIT_INTEGER = Math.pow(2, 16) - 1, MAX_32BIT_INTEGER = Math.pow(2, 32) - 1, MAX_SIGNED_8BIT_INTEGER = Math.pow(2, 7) - 1, MAX_SIGNED_16BIT_INTEGER = Math.pow(2, 15) - 1, MAX_SIGNED_32BIT_INTEGER = Math.pow(2, 31) - 1;
    exports.getPointerArray = function(size) {
      var maxIndex = size - 1;
      if (maxIndex <= MAX_8BIT_INTEGER)
        return Uint8Array;
      if (maxIndex <= MAX_16BIT_INTEGER)
        return Uint16Array;
      if (maxIndex <= MAX_32BIT_INTEGER)
        return Uint32Array;
      throw new Error("mnemonist: Pointer Array of size > 4294967295 is not supported.");
    }, exports.getSignedPointerArray = function(size) {
      var maxIndex = size - 1;
      return maxIndex <= MAX_SIGNED_8BIT_INTEGER ? Int8Array : maxIndex <= MAX_SIGNED_16BIT_INTEGER ? Int16Array : maxIndex <= MAX_SIGNED_32BIT_INTEGER ? Int32Array : Float64Array;
    }, exports.getNumberType = function(value) {
      return value === (value | 0) ? Math.sign(value) === -1 ? value <= 127 && value >= -128 ? Int8Array : value <= 32767 && value >= -32768 ? Int16Array : Int32Array : value <= 255 ? Uint8Array : value <= 65535 ? Uint16Array : Uint32Array : Float64Array;
    };
    var TYPE_PRIORITY = {
      Uint8Array: 1,
      Int8Array: 2,
      Uint16Array: 3,
      Int16Array: 4,
      Uint32Array: 5,
      Int32Array: 6,
      Float32Array: 7,
      Float64Array: 8
    };
    exports.getMinimalRepresentation = function(array, getter) {
      var maxType = null, maxPriority = 0, p, t, v, i, l;
      for (i = 0, l = array.length; i < l; i++)
        v = getter ? getter(array[i]) : array[i], t = exports.getNumberType(v), p = TYPE_PRIORITY[t.name], p > maxPriority && (maxPriority = p, maxType = t);
      return maxType;
    }, exports.isTypedArray = function(value) {
      return typeof ArrayBuffer < "u" && ArrayBuffer.isView(value);
    }, exports.concat = function() {
      var length = 0, i, o, l;
      for (i = 0, l = arguments.length; i < l; i++)
        length += arguments[i].length;
      var array = new arguments[0].constructor(length);
      for (i = 0, o = 0; i < l; i++)
        array.set(arguments[i], o), o += arguments[i].length;
      return array;
    }, exports.indices = function(length) {
      for (var PointerArray = exports.getPointerArray(length), array = new PointerArray(length), i = 0; i < length; i++)
        array[i] = i;
      return array;
    };
  }(typedArrays)), typedArrays;
}
var iterables = {}, hasRequiredIterables;
function requireIterables() {
  if (hasRequiredIterables) return iterables;
  hasRequiredIterables = 1;
  var forEach = requireForeach(), typed = requireTypedArrays();
  function isArrayLike(target) {
    return Array.isArray(target) || typed.isTypedArray(target);
  }
  function guessLength(target) {
    if (typeof target.length == "number")
      return target.length;
    if (typeof target.size == "number")
      return target.size;
  }
  function toArray(target) {
    var l = guessLength(target), array = typeof l == "number" ? new Array(l) : [], i = 0;
    return forEach(target, function(value) {
      array[i++] = value;
    }), array;
  }
  function toArrayWithIndices(target) {
    var l = guessLength(target), IndexArray = typeof l == "number" ? typed.getPointerArray(l) : Array, array = typeof l == "number" ? new Array(l) : [], indices = typeof l == "number" ? new IndexArray(l) : [], i = 0;
    return forEach(target, function(value) {
      array[i] = value, indices[i] = i++;
    }), [array, indices];
  }
  return iterables.isArrayLike = isArrayLike, iterables.guessLength = guessLength, iterables.toArray = toArray, iterables.toArrayWithIndices = toArrayWithIndices, iterables;
}
var lruCache, hasRequiredLruCache;
function requireLruCache() {
  if (hasRequiredLruCache) return lruCache;
  hasRequiredLruCache = 1;
  var Iterator = requireIterator(), forEach = requireForeach(), typed = requireTypedArrays(), iterables2 = requireIterables();
  function LRUCache(Keys, Values, capacity) {
    if (arguments.length < 2 && (capacity = Keys, Keys = null, Values = null), this.capacity = capacity, typeof this.capacity != "number" || this.capacity <= 0)
      throw new Error("mnemonist/lru-cache: capacity should be positive number.");
    if (!isFinite(this.capacity) || Math.floor(this.capacity) !== this.capacity)
      throw new Error("mnemonist/lru-cache: capacity should be a finite positive integer.");
    var PointerArray = typed.getPointerArray(capacity);
    this.forward = new PointerArray(capacity), this.backward = new PointerArray(capacity), this.K = typeof Keys == "function" ? new Keys(capacity) : new Array(capacity), this.V = typeof Values == "function" ? new Values(capacity) : new Array(capacity), this.size = 0, this.head = 0, this.tail = 0, this.items = {};
  }
  return LRUCache.prototype.clear = function() {
    this.size = 0, this.head = 0, this.tail = 0, this.items = {};
  }, LRUCache.prototype.splayOnTop = function(pointer) {
    var oldHead = this.head;
    if (this.head === pointer)
      return this;
    var previous = this.backward[pointer], next = this.forward[pointer];
    return this.tail === pointer ? this.tail = previous : this.backward[next] = previous, this.forward[previous] = next, this.backward[oldHead] = pointer, this.head = pointer, this.forward[pointer] = oldHead, this;
  }, LRUCache.prototype.set = function(key, value) {
    var pointer = this.items[key];
    if (typeof pointer < "u") {
      this.splayOnTop(pointer), this.V[pointer] = value;
      return;
    }
    this.size < this.capacity ? pointer = this.size++ : (pointer = this.tail, this.tail = this.backward[pointer], delete this.items[this.K[pointer]]), this.items[key] = pointer, this.K[pointer] = key, this.V[pointer] = value, this.forward[pointer] = this.head, this.backward[this.head] = pointer, this.head = pointer;
  }, LRUCache.prototype.setpop = function(key, value) {
    var oldValue = null, oldKey = null, pointer = this.items[key];
    return typeof pointer < "u" ? (this.splayOnTop(pointer), oldValue = this.V[pointer], this.V[pointer] = value, { evicted: false, key, value: oldValue }) : (this.size < this.capacity ? pointer = this.size++ : (pointer = this.tail, this.tail = this.backward[pointer], oldValue = this.V[pointer], oldKey = this.K[pointer], delete this.items[oldKey]), this.items[key] = pointer, this.K[pointer] = key, this.V[pointer] = value, this.forward[pointer] = this.head, this.backward[this.head] = pointer, this.head = pointer, oldKey ? { evicted: true, key: oldKey, value: oldValue } : null);
  }, LRUCache.prototype.has = function(key) {
    return key in this.items;
  }, LRUCache.prototype.get = function(key) {
    var pointer = this.items[key];
    if (!(typeof pointer > "u"))
      return this.splayOnTop(pointer), this.V[pointer];
  }, LRUCache.prototype.peek = function(key) {
    var pointer = this.items[key];
    if (!(typeof pointer > "u"))
      return this.V[pointer];
  }, LRUCache.prototype.forEach = function(callback, scope) {
    scope = arguments.length > 1 ? scope : this;
    for (var i = 0, l = this.size, pointer = this.head, keys = this.K, values = this.V, forward = this.forward; i < l; )
      callback.call(scope, values[pointer], keys[pointer], this), pointer = forward[pointer], i++;
  }, LRUCache.prototype.keys = function() {
    var i = 0, l = this.size, pointer = this.head, keys = this.K, forward = this.forward;
    return new Iterator(function() {
      if (i >= l)
        return { done: true };
      var key = keys[pointer];
      return i++, i < l && (pointer = forward[pointer]), {
        done: false,
        value: key
      };
    });
  }, LRUCache.prototype.values = function() {
    var i = 0, l = this.size, pointer = this.head, values = this.V, forward = this.forward;
    return new Iterator(function() {
      if (i >= l)
        return { done: true };
      var value = values[pointer];
      return i++, i < l && (pointer = forward[pointer]), {
        done: false,
        value
      };
    });
  }, LRUCache.prototype.entries = function() {
    var i = 0, l = this.size, pointer = this.head, keys = this.K, values = this.V, forward = this.forward;
    return new Iterator(function() {
      if (i >= l)
        return { done: true };
      var key = keys[pointer], value = values[pointer];
      return i++, i < l && (pointer = forward[pointer]), {
        done: false,
        value: [key, value]
      };
    });
  }, typeof Symbol < "u" && (LRUCache.prototype[Symbol.iterator] = LRUCache.prototype.entries), LRUCache.prototype.inspect = function() {
    for (var proxy = /* @__PURE__ */ new Map(), iterator2 = this.entries(), step; step = iterator2.next(), !step.done; )
      proxy.set(step.value[0], step.value[1]);
    return Object.defineProperty(proxy, "constructor", {
      value: LRUCache,
      enumerable: false
    }), proxy;
  }, typeof Symbol < "u" && (LRUCache.prototype[Symbol.for("nodejs.util.inspect.custom")] = LRUCache.prototype.inspect), LRUCache.from = function(iterable, Keys, Values, capacity) {
    if (arguments.length < 2) {
      if (capacity = iterables2.guessLength(iterable), typeof capacity != "number")
        throw new Error("mnemonist/lru-cache.from: could not guess iterable length. Please provide desired capacity as last argument.");
    } else arguments.length === 2 && (capacity = Keys, Keys = null, Values = null);
    var cache2 = new LRUCache(Keys, Values, capacity);
    return forEach(iterable, function(value, key) {
      cache2.set(key, value);
    }), cache2;
  }, lruCache = LRUCache, lruCache;
}
var memory, hasRequiredMemory;
function requireMemory() {
  if (hasRequiredMemory) return memory;
  hasRequiredMemory = 1;
  const LRUCache = requireLruCache(), { abstractLogging } = requireUtil(), StorageInterface = require_interface(), { findMatchingIndexes, findNotMatching, bsearchIndex, wildcardMatch } = requireUtil(), setImmediate = typeof globalThis.setImmediate < "u" ? globalThis.setImmediate : (fn, ...args) => setTimeout(fn, 0, ...args), DEFAULT_CACHE_SIZE = 1024;
  class StorageMemory extends StorageInterface {
    /**
     * in-memory storage
     * @param {StorageMemoryOptions} options
     */
    constructor(options = {}) {
      if (options.size && (typeof options.size != "number" || options.size < 1))
        throw new Error("size must be a positive integer greater than 0");
      super(options), this.size = options.size || DEFAULT_CACHE_SIZE, this.log = options.log || abstractLogging(), this.invalidation = options.invalidation || false, this.init();
    }
    init() {
      this.store = new LRUCache(this.size), this.invalidation && (this.keysReferences = /* @__PURE__ */ new Map(), this.referencesKeys = /* @__PURE__ */ new Map());
    }
    /**
     * retrieve the value by key
     * @param {string} key
     * @returns {undefined|*} undefined if key not found or expired
     */
    get(key) {
      this.log.debug({ msg: "acd/storage/memory.get", key });
      const entry = this.store.get(key);
      if (entry) {
        if (this.log.debug({ msg: "acd/storage/memory.get, entry", entry, now: now() }), entry.start + entry.ttl > now())
          return this.log.debug({ msg: "acd/storage/memory.get, key is NOT expired", key, entry }), entry.value;
        this.log.debug({ msg: "acd/storage/memory.get, key is EXPIRED", key, entry }), setImmediate(() => this.remove(key));
      }
    }
    /**
     * retrieve the remaining TTL value by key
     * @param {string} key
     * @returns {undefined|*} undefined if key not found or expired
     */
    getTTL(key) {
      this.log.debug({ msg: "acd/storage/memory.getTTL", key });
      const entry = this.store.peek(key);
      let ttl = 0;
      return entry && (ttl = entry.start + entry.ttl - now(), ttl < 0 && (ttl = 0)), ttl;
    }
    /**
     * set value by key
     * @param {string} key
     * @param {*} value
     * @param {?number} [ttl=0] - ttl in seconds; zero means key will not be stored
     * @param {?string[]} references
     */
    set(key, value, ttl, references) {
      if (this.log.debug({ msg: "acd/storage/memory.set", key, value, ttl, references }), ttl = Number(ttl), !ttl || ttl < 0)
        return;
      const existingKey = this.store.has(key), removed = this.store.setpop(key, { value, ttl, start: now() });
      if (this.log.debug({ msg: "acd/storage/memory.set, evicted", removed }), removed && removed.evicted && (this.log.debug({ msg: "acd/storage/memory.set, remove evicted key", key: removed.key }), this._removeReferences([removed.key])), !references || references.length < 1)
        return;
      if (!this.invalidation) {
        this.log.warn({ msg: "acd/storage/memory.set, invalidation is disabled, references are useless" });
        return;
      }
      references = [...new Set(references)];
      let currentReferences;
      if (existingKey && (currentReferences = this.keysReferences.get(key), this.log.debug({ msg: "acd/storage/memory.set, current keys-references", key, references: currentReferences }), currentReferences)) {
        currentReferences.sort(), references.sort();
        const referencesToRemove = findNotMatching(references, currentReferences);
        for (const reference of referencesToRemove) {
          const keys = this.referencesKeys.get(reference);
          if (!keys)
            continue;
          const index = bsearchIndex(keys, key);
          if (!(index < 0)) {
            if (keys.splice(index, 1), keys.length < 1) {
              this.referencesKeys.delete(reference);
              continue;
            }
            this.referencesKeys.set(reference, keys);
          }
        }
      }
      const referencesToAdd = currentReferences ? findNotMatching(currentReferences, references) : references;
      for (let i = 0; i < referencesToAdd.length; i++) {
        const reference = referencesToAdd[i];
        let keys = this.referencesKeys.get(reference);
        keys ? (this.log.debug({ msg: "acd/storage/memory.set, add reference-key", key, reference }), keys.push(key)) : keys = [key], this.log.debug({ msg: "acd/storage/memory.set, set reference-keys", keys, reference }), this.referencesKeys.set(reference, keys);
      }
      this.keysReferences.set(key, references);
    }
    /**
     * remove an entry by key
     * @param {string} key
     * @returns {boolean} indicates if key was removed
     */
    remove(key) {
      this.log.debug({ msg: "acd/storage/memory.remove", key });
      const removed = this._removeKey(key);
      return this._removeReferences([key]), removed;
    }
    /**
     * @param {string} key
     * @returns {boolean}
     */
    _removeKey(key) {
      return this.log.debug({ msg: "acd/storage/memory._removeKey", key }), this.store.has(key) ? (this.store.set(key, void 0), true) : false;
    }
    /**
     * @param {string[]} keys
     */
    _removeReferences(keys) {
      if (!this.invalidation)
        return;
      this.log.debug({ msg: "acd/storage/memory._removeReferences", keys });
      const referencesToRemove = /* @__PURE__ */ new Set();
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i], references = this.keysReferences.get(key);
        if (references) {
          for (let j = 0; j < references.length; j++)
            referencesToRemove.add(references[j]);
          this.log.debug({ msg: "acd/storage/memory._removeReferences, delete key-references", key }), this.keysReferences.delete(key);
        }
      }
      this._removeReferencesKeys([...referencesToRemove], keys);
    }
    /**
     * @param {!string[]} references
     * @param {string[]} keys
     */
    _removeReferencesKeys(references, keys) {
      keys.sort(), this.log.debug({ msg: "acd/storage/memory._removeReferencesKeys", references, keys });
      for (let i = 0; i < references.length; i++) {
        const reference = references[i], referencesKeys = this.referencesKeys.get(reference);
        if (this.log.debug({ msg: "acd/storage/memory._removeReferencesKeys, get reference-key", reference, keys, referencesKeys }), !referencesKeys) continue;
        const referencesToRemove = findMatchingIndexes(keys, referencesKeys);
        if (this.log.debug({ msg: "acd/storage/memory._removeReferencesKeys, removing", reference, referencesToRemove, referencesKeys }), referencesToRemove.length === referencesKeys.length) {
          this.log.debug({ msg: "acd/storage/memory._removeReferencesKeys, delete", reference }), this.referencesKeys.delete(reference);
          continue;
        }
        for (let j = referencesToRemove.length - 1; j >= 0; j--)
          this.log.debug({ msg: "acd/storage/memory._removeReferencesKeys, remove", reference, referencesKeys, at: referencesToRemove[j] }), referencesKeys.splice(referencesToRemove[j], 1);
      }
    }
    /**
     * @param {string|string[]} references
     * @returns {string[]} removed keys
     */
    invalidate(references) {
      return this.invalidation ? (this.log.debug({ msg: "acd/storage/memory.invalidate", references }), Array.isArray(references) ? this._invalidateReferences(references) : this._invalidateReference(references)) : (this.log.warn({ msg: "acd/storage/memory.invalidate, exit due invalidation is disabled" }), []);
    }
    /**
     * @param {string[]} references
     * @returns {string[]} removed keys
     */
    _invalidateReferences(references) {
      const removed = [];
      for (let i = 0; i < references.length; i++) {
        const reference = references[i], keys = this.referencesKeys.get(reference);
        if (this.log.debug({ msg: "acd/storage/memory._invalidateReferences, remove keys on reference", reference, keys }), !!keys) {
          for (let j = 0; j < keys.length; j++) {
            const key = keys[j];
            this.log.debug({ msg: "acd/storage/memory._invalidateReferences, remove key on reference", reference, key }), this._removeKey(key) && removed.push(key);
          }
          this.log.debug({ msg: "acd/storage/memory._invalidateReferences, remove references of", reference, keys }), this._removeReferences([...keys]);
        }
      }
      return removed;
    }
    /**
     * @param {string} reference
     * @returns {string[]} removed keys
     */
    _invalidateReference(reference) {
      if (reference.includes("*")) {
        const references = [];
        for (const key of this.referencesKeys.keys())
          wildcardMatch(reference, key) && references.push(key);
        return this._invalidateReferences(references);
      }
      const keys = this.referencesKeys.get(reference), removed = [];
      if (this.log.debug({ msg: "acd/storage/memory._invalidateReference, remove keys on reference", reference, keys }), !keys)
        return removed;
      for (let j = 0; j < keys.length; j++) {
        const key = keys[j];
        this.log.debug({ msg: "acd/storage/memory._invalidateReference, remove key on reference", reference, key }), this._removeKey(key) && removed.push(key);
      }
      return this.log.debug({ msg: "acd/storage/memory._invalidateReference, remove references of", reference, keys }), this._removeReferences([...keys]), removed;
    }
    /**
     * remove all entries if name is not provided
     * remove entries where key starts with name if provided
     * @param {?string} name
     * @return {string[]} removed keys
     */
    clear(name) {
      if (this.log.debug({ msg: "acd/storage/memory.clear", name }), !name) {
        if (this.store.clear(), !this.invalidation)
          return;
        this.referencesKeys.clear(), this.keysReferences.clear();
        return;
      }
      const keys = [];
      this.store.forEach((value, key) => {
        this.log.debug({ msg: "acd/storage/memory.clear, iterate key", key }), key.indexOf(name) === 0 && (this.log.debug({ msg: "acd/storage/memory.clear, remove key", key }), keys.push(key));
      });
      const removed = [];
      for (let i = 0; i < keys.length; i++)
        this._removeKey(keys[i]) && removed.push(keys[i]);
      return this._removeReferences(removed), removed;
    }
    refresh() {
      this.log.debug({ msg: "acd/storage/memory.refresh" }), this.init();
    }
  }
  let _timer;
  function now() {
    if (_timer !== void 0)
      return _timer;
    _timer = Math.floor(Date.now() / 1e3);
    const timeout = setTimeout(_clearTimer, 1e3);
    return typeof timeout.unref == "function" && timeout.unref(), _timer;
  }
  function _clearTimer() {
    _timer = void 0;
  }
  return memory = StorageMemory, memory;
}
var storage, hasRequiredStorage;
function requireStorage() {
  if (hasRequiredStorage) return storage;
  hasRequiredStorage = 1;
  const { isServerSide } = requireUtil();
  let StorageRedis;
  isServerSide && (StorageRedis = requireRedis());
  const StorageMemory = requireMemory(), StorageOptionsType = {
    redis: "redis",
    memory: "memory"
  };
  function createStorage(type, options) {
    if (!isServerSide && type === StorageOptionsType.redis)
      throw new Error("Redis storage is not supported in the browser");
    return type === StorageOptionsType.redis ? new StorageRedis(options) : new StorageMemory(options);
  }
  return storage = createStorage, storage;
}
var hasRequiredCache;
function requireCache() {
  if (hasRequiredCache) return cache;
  hasRequiredCache = 1;
  const { kValues, kStorage, kStorages, kTransfromer, kTTL, kOnDedupe, kOnError, kOnHit, kOnMiss, kStale } = requireSymbol(), stringify = requireSafeStableStringify(), createStorage = requireStorage();
  class Cache {
    /**
     * @param {!Object} opts
     * @param {!Storage} opts.storage - the storage to use
     * @param {?Object} opts.transformer - the transformer to use
     * @param {?number} [opts.ttl=0] - in seconds; default is 0 seconds, so it only does dedupe without cache
     * @param {?function} opts.onDedupe
     * @param {?function} opts.onError
     * @param {?function} opts.onHit
     * @param {?function} opts.onMiss
     */
    constructor(options = {}) {
      if (!options.storage)
        throw new Error("storage is required");
      if (options.ttl && typeof options.ttl == "number" && (options.ttl < 0 || !Number.isInteger(options.ttl)))
        throw new Error("ttl must be a positive integer greater than 0");
      if (options.onDedupe && typeof options.onDedupe != "function")
        throw new Error("onDedupe must be a function");
      if (options.onError && typeof options.onError != "function")
        throw new Error("onError must be a function");
      if (options.onHit && typeof options.onHit != "function")
        throw new Error("onHit must be a function");
      if (options.onMiss && typeof options.onMiss != "function")
        throw new Error("onMiss must be a function");
      if (typeof options.stale == "number" && !(Math.floor(options.stale) === options.stale && options.stale >= 0))
        throw new Error("stale must be an integer greater or equal to 0");
      this[kValues] = {}, this[kStorage] = options.storage, this[kStorages] = /* @__PURE__ */ new Map(), this[kStorages].set("_default", options.storage), this[kTransfromer] = options.transformer, this[kTTL] = options.ttl || 0, this[kOnDedupe] = options.onDedupe || noop, this[kOnError] = options.onError || noop, this[kOnHit] = options.onHit || noop, this[kOnMiss] = options.onMiss || noop, this[kStale] = options.stale || 0;
    }
    /**
     * add a new function to dedupe (and cache)
     * @param {!string} name name of the function
     * @param {?Object} [opts]
     * @param {?Object} [opts.storage] storage to use; default is the main one
     * @param {?Object} opts.transformer - the transformer to use
     * @param {?number} [opts.ttl] ttl for the results; default ttl is the one passed to the constructor
     * @param {?function} [opts.onDedupe] function to call on dedupe; default is the one passed to the constructor
     * @param {?function} [opts.onError] function to call on error; default is the one passed to the constructor
     * @param {?function} [opts.onHit] function to call on hit; default is the one passed to the constructor
     * @param {?function} [opts.onMiss] function to call on miss; default is the one passed to the constructor
     * @param {?function} [opts.serialize] custom function to serialize the arguments of `func`, in order to create the key for deduping and caching
     * @param {?function} [opts.references] function to generate references
     * @param {!function} func the function to dedupe (and cache)
     **/
    define(name, opts, func) {
      if (typeof opts == "function" && (func = opts, opts = {}), name && this[name])
        throw new Error(`${name} is already defined in the cache or it is a forbidden name`);
      if (opts = opts || {}, typeof func != "function")
        throw new TypeError(`Missing the function parameter for '${name}'`);
      const serialize = opts.serialize;
      if (serialize && typeof serialize != "function")
        throw new TypeError("serialize must be a function");
      const references = opts.references;
      if (references && typeof references != "function")
        throw new TypeError("references must be a function");
      if (typeof opts.ttl != "function" && opts.ttl && (typeof opts.ttl != "number" || opts.ttl < 0 || !Number.isInteger(opts.ttl)))
        throw new Error("ttl must be a positive integer greater than 0");
      let storage2;
      opts.storage ? (storage2 = createStorage(opts.storage.type, opts.storage.options), this[kStorages].set(name, storage2)) : storage2 = this[kStorage];
      const ttl = opts.ttl !== void 0 ? opts.ttl : this[kTTL], stale = opts.stale !== void 0 ? opts.stale : this[kStale], onDedupe = opts.onDedupe || this[kOnDedupe], onError = opts.onError || this[kOnError], onHit = opts.onHit || this[kOnHit], onMiss = opts.onMiss || this[kOnMiss], transformer = opts.transformer || this[kTransfromer], wrapper = new Wrapper(func, name, serialize, references, storage2, transformer, ttl, onDedupe, onError, onHit, onMiss, stale);
      return this[kValues][name] = wrapper, this[name] = wrapper.add.bind(wrapper), this;
    }
    async clear(name, value) {
      if (name) {
        if (!this[kValues][name])
          throw new Error(`${name} is not defined in the cache`);
        await this[kValues][name].clear(value);
        return;
      }
      const clears = [];
      for (const wrapper of Object.values(this[kValues]))
        clears.push(wrapper.clear());
      await Promise.all(clears);
    }
    async get(name, key) {
      if (!this[kValues][name])
        throw new Error(`${name} is not defined in the cache`);
      return this[kValues][name].get(key);
    }
    async set(name, key, value, ttl, references) {
      if (!this[kValues][name])
        throw new Error(`${name} is not defined in the cache`);
      return this[kValues][name].set(key, value, ttl, references);
    }
    async invalidate(name, references) {
      if (!this[kValues][name])
        throw new Error(`${name} is not defined in the cache`);
      return this[kValues][name].invalidate(references);
    }
    async invalidateAll(references, storage2 = "_default") {
      if (!this[kStorages].has(storage2))
        throw new Error(`${storage2} storage is not defined in the cache`);
      await this[kStorages].get(storage2).invalidate(references);
    }
  }
  class Wrapper {
    /**
     * @param {function} func
     * @param {string} name
     * @param {function} serialize
     * @param {function} references
     * @param {Storage} storage
     * @param {Object} transformer
     * @param {number} ttl
     * @param {function} onDedupe
     * @param {function} onError
     * @param {function} onHit
     * @param {function} onMiss
     * @param {stale} ttl
     */
    constructor(func, name, serialize, references, storage2, transformer, ttl, onDedupe, onError, onHit, onMiss, stale) {
      this.dedupes = /* @__PURE__ */ new Map(), this.func = func, this.name = name, this.serialize = serialize, this.references = references, this.storage = storage2, this.transformer = transformer, this.ttl = ttl, this.onDedupe = onDedupe, this.onError = onError, this.onHit = onHit, this.onMiss = onMiss, this.stale = stale;
    }
    getKey(args) {
      const id = this.serialize ? this.serialize(args) : args;
      return typeof id == "string" ? id : stringify(id);
    }
    getStorageKey(key) {
      return `${this.name}~${key}`;
    }
    getStorageName() {
      return `${this.name}~`;
    }
    add(args) {
      try {
        const key = this.getKey(args);
        let query = this.dedupes.get(key);
        return query ? this.onDedupe(key) : (query = new Query(), this.buildPromise(query, args, key), this.dedupes.set(key, query)), query.promise;
      } catch (err) {
        this.onError(err);
      }
    }
    /**
     * wrap the original func to sync storage
     */
    async wrapFunction(args, key) {
      const storageKey = this.getStorageKey(key);
      if (this.ttl > 0 || typeof this.ttl == "function") {
        const data = await this.get(storageKey);
        if (data !== void 0) {
          this.onHit(key);
          const stale = typeof this.stale == "function" ? this.stale(data) : this.stale;
          return stale > 0 && await this.storage.getTTL(storageKey) <= stale && this._wrapFunction(storageKey, args, key).catch(noop), data;
        } else
          this.onMiss(key);
      }
      return this._wrapFunction(storageKey, args, key);
    }
    async _wrapFunction(storageKey, args, key) {
      const result = await this.func(args, key), stale = typeof this.stale == "function" ? this.stale(result) : this.stale;
      let ttl = typeof this.ttl == "function" ? this.ttl(result) : this.ttl;
      if (ttl == null || typeof ttl != "number" || !Number.isInteger(ttl))
        return this.onError(new Error("ttl must be an integer")), result;
      if (ttl += stale, ttl < 1)
        return result;
      if (!this.references)
        return await this.set(storageKey, result, ttl), result;
      try {
        let references = this.references(args, key, result), value = result;
        references && typeof references.then == "function" && (references = await references), this.transformer && (value = this.transformer.serialize(result)), await this.storage.set(storageKey, value, ttl, references);
      } catch (err) {
        this.onError(err);
      }
      return result;
    }
    buildPromise(query, args, key) {
      query.promise = this.wrapFunction(args, key), query.promise.then((result) => (this.dedupes.delete(key), result)).catch((err) => {
        this.onError(err), this.dedupes.delete(key);
        const r = this.storage.remove(this.getStorageKey(key));
        r && typeof r.catch == "function" && r.catch(noop);
      });
    }
    async clear(value) {
      if (value) {
        const key = this.getKey(value);
        this.dedupes.delete(key), await this.storage.remove(this.getStorageKey(key));
        return;
      }
      await this.storage.clear(this.getStorageName()), this.dedupes.clear();
    }
    async get(key) {
      const data = await this.storage.get(key);
      return this.transformer && data ? await this.transformer.deserialize(data) : data;
    }
    async set(key, value, ttl, references) {
      return this.transformer && (value = this.transformer.serialize(value)), this.storage.set(key, value, ttl, references);
    }
    async invalidate(references) {
      return this.storage.invalidate(references);
    }
  }
  class Query {
    constructor() {
      this.promise = null;
    }
  }
  function noop() {
  }
  return cache.Cache = Cache, cache;
}
var asyncCacheDedupe, hasRequiredAsyncCacheDedupe;
function requireAsyncCacheDedupe() {
  if (hasRequiredAsyncCacheDedupe) return asyncCacheDedupe;
  hasRequiredAsyncCacheDedupe = 1;
  const { Cache } = requireCache(), createStorage = requireStorage();
  function createCache(options) {
    options ? options.storage || (options.storage = { type: "memory" }) : options = { storage: { type: "memory" } };
    const storage2 = createStorage(options.storage.type, options.storage.options);
    return new Cache({
      ...options,
      storage: storage2
    });
  }
  return asyncCacheDedupe = {
    Cache,
    createCache,
    createStorage
  }, asyncCacheDedupe;
}
var asyncCacheDedupeExports = requireAsyncCacheDedupe();
let tasks = 0, resolves = [];
function startTask() {
  return tasks += 1, () => {
    if (tasks -= 1, tasks === 0) {
      let prevResolves = resolves;
      resolves = [];
      for (let i of prevResolves) i();
    }
  };
}
let clean = Symbol("clean"), listenerQueue = [], atom = (initialValue, level) => {
  let listeners = [], $atom = {
    get() {
      return $atom.lc || $atom.listen(() => {
      })(), $atom.value;
    },
    l: level || 0,
    lc: 0,
    listen(listener, listenerLevel) {
      return $atom.lc = listeners.push(listener, listenerLevel || $atom.l) / 2, () => {
        let index = listeners.indexOf(listener);
        ~index && (listeners.splice(index, 2), --$atom.lc || $atom.off());
      };
    },
    notify(oldValue, changedKey) {
      let runListenerQueue = !listenerQueue.length;
      for (let i = 0; i < listeners.length; i += 2)
        listenerQueue.push(
          listeners[i],
          listeners[i + 1],
          $atom.value,
          oldValue,
          changedKey
        );
      if (runListenerQueue) {
        for (let i = 0; i < listenerQueue.length; i += 5) {
          let skip;
          for (let j = i + 1; !skip && (j += 5) < listenerQueue.length; )
            listenerQueue[j] < listenerQueue[i + 1] && (skip = listenerQueue.push(
              listenerQueue[i],
              listenerQueue[i + 1],
              listenerQueue[i + 2],
              listenerQueue[i + 3],
              listenerQueue[i + 4]
            ));
          skip || listenerQueue[i](
            listenerQueue[i + 2],
            listenerQueue[i + 3],
            listenerQueue[i + 4]
          );
        }
        listenerQueue.length = 0;
      }
    },
    /* It will be called on last listener unsubscribing.
       We will redefine it in onMount and onStop. */
    off() {
    },
    set(newValue) {
      let oldValue = $atom.value;
      oldValue !== newValue && ($atom.value = newValue, $atom.notify(oldValue));
    },
    subscribe(listener, listenerLevel) {
      let unbind = $atom.listen(listener, listenerLevel);
      return listener($atom.value), unbind;
    },
    value: initialValue
  };
  return process.env.NODE_ENV !== "production" && ($atom[clean] = () => {
    listeners = [], $atom.lc = 0, $atom.off();
  }), $atom;
};
const MOUNT = 5, UNMOUNT = 6, REVERT_MUTATION = 10;
let on = (object2, listener, eventKey, mutateStore) => (object2.events = object2.events || {}, object2.events[eventKey + REVERT_MUTATION] || (object2.events[eventKey + REVERT_MUTATION] = mutateStore((eventProps) => {
  object2.events[eventKey].reduceRight((event, l) => (l(event), event), {
    shared: {},
    ...eventProps
  });
})), object2.events[eventKey] = object2.events[eventKey] || [], object2.events[eventKey].push(listener), () => {
  let currentListeners = object2.events[eventKey], index = currentListeners.indexOf(listener);
  currentListeners.splice(index, 1), currentListeners.length || (delete object2.events[eventKey], object2.events[eventKey + REVERT_MUTATION](), delete object2.events[eventKey + REVERT_MUTATION]);
}), STORE_UNMOUNT_DELAY = 1e3, onMount = ($store, initialize) => on($store, (payload) => {
  let destroy = initialize(payload);
  destroy && $store.events[UNMOUNT].push(destroy);
}, MOUNT, (runListeners) => {
  let originListen = $store.listen;
  $store.listen = (...args) => (!$store.lc && !$store.active && ($store.active = true, runListeners()), originListen(...args));
  let originOff = $store.off;
  if ($store.events[UNMOUNT] = [], $store.off = () => {
    originOff(), setTimeout(() => {
      if ($store.active && !$store.lc) {
        $store.active = false;
        for (let destroy of $store.events[UNMOUNT]) destroy();
        $store.events[UNMOUNT] = [];
      }
    }, STORE_UNMOUNT_DELAY);
  }, process.env.NODE_ENV !== "production") {
    let originClean = $store[clean];
    $store[clean] = () => {
      for (let destroy of $store.events[UNMOUNT]) destroy();
      $store.events[UNMOUNT] = [], $store.active = false, originClean();
    };
  }
  return () => {
    $store.listen = originListen, $store.off = originOff;
  };
}), map = (initial = {}) => {
  let $map = atom(initial);
  return $map.setKey = function(key, value) {
    let oldMap = $map.value;
    typeof value > "u" && key in $map.value ? ($map.value = { ...$map.value }, delete $map.value[key], $map.notify(oldMap, key)) : $map.value[key] !== value && ($map.value = {
      ...$map.value,
      [key]: value
    }, $map.notify(oldMap, key));
  }, $map;
};
const runtime = typeof document > "u" ? "server" : "browser", defineEnableLiveMode = (config) => {
  const { ssr, setFetcher } = config;
  return (options) => {
    if (runtime === "server")
      throw new Error("Live mode is not supported in server environments");
    if (ssr && !options.client)
      throw new Error("The `client` option in `enableLiveMode` is required");
    const client2 = options.client || config.client || void 0, controller = new AbortController();
    let disableLiveMode;
    return import("./enableLiveMode.js").then(({ enableLiveMode }) => {
      controller.signal.aborted || (disableLiveMode = enableLiveMode({ ...options, client: client2, setFetcher, ssr }));
    }), () => {
      controller.abort(), disableLiveMode?.();
    };
  };
};
function cloneClientWithConfig(newClient) {
  return newClient.withConfig({
    allowReconfigure: false
  });
}
const createQueryStore$1 = (options) => {
  const { ssr = false, tag: tag2 = "core-loader" } = options;
  if (ssr && options.client)
    throw new TypeError(
      "`client` option is not allowed when `ssr: true`, use `setServerClient` from your server entry point instead"
    );
  if (!ssr && options.client === false)
    throw new TypeError("You must set `ssr: true` when `client: false` is used");
  if (!ssr && !options.client)
    throw new TypeError("`client` is required");
  let client2 = ssr ? void 0 : cloneClientWithConfig(options.client);
  function createDefaultCache(client22) {
    return asyncCacheDedupeExports.createCache().define("fetch", async (key) => {
      if (!client22)
        throw new Error(
          "You have to set the Sanity client with `setServerClient` before any data fetching is done"
        );
      const { query, params = {}, perspective, useCdn, stega } = JSON.parse(key), { result, resultSourceMap } = await client22.fetch(query, params, {
        tag: tag2,
        filterResponse: false,
        perspective,
        useCdn,
        stega
      });
      return { result, resultSourceMap };
    });
  }
  function createDefaultFetcher() {
    const initialPerspective = client2?.config().perspective || "published";
    return unstable__cache.instance = createDefaultCache(client2), {
      hydrate: (_query, _params, initial) => ({
        loading: initial?.data === void 0 || initial?.sourceMap === void 0,
        error: void 0,
        data: initial?.data,
        sourceMap: initial?.sourceMap,
        perspective: initialPerspective
      }),
      fetch: (query, params, $fetch, controller) => {
        if (controller.signal.aborted) return;
        const finishTask = startTask();
        $fetch.setKey("loading", true), $fetch.setKey("error", void 0), unstable__cache.instance.fetch(JSON.stringify({ query, params })).then((response) => {
          controller.signal.aborted || ($fetch.setKey("data", response.result), $fetch.setKey("sourceMap", response.resultSourceMap), $fetch.setKey("perspective", initialPerspective));
        }).catch((reason) => {
          $fetch.setKey("error", reason);
        }).finally(() => {
          $fetch.setKey("loading", false), finishTask();
        });
      }
    };
  }
  const unstable__cache = {
    instance: createDefaultCache(client2)
  }, $fetcher = atom(client2 ? createDefaultFetcher() : void 0), enableLiveMode = defineEnableLiveMode({
    client: client2 || void 0,
    ssr,
    setFetcher: (fetcher) => {
      const originalFetcher = $fetcher.get();
      return $fetcher.set(fetcher), () => $fetcher.set(originalFetcher);
    }
  }), createFetcherStore = (query, params = {}, initial) => {
    const fetcher = $fetcher.get(), $fetch = map(
      fetcher ? fetcher.hydrate(query, params, initial) : {
        loading: false,
        error: typeof initial?.data > "u" ? new Error(
          "The `initial` option is required when `ssr: true`"
        ) : void 0,
        data: initial?.data,
        sourceMap: initial?.sourceMap,
        perspective: initial?.perspective
      }
    );
    return onMount($fetch, () => {
      let controller = new AbortController();
      const unsubscribe = $fetcher.subscribe((fetcher2) => {
        !fetcher2 || controller.signal.aborted || (controller.abort(), controller = new AbortController(), fetcher2.fetch(query, params, $fetch, controller));
      });
      return () => {
        controller.abort(), unsubscribe();
      };
    }), $fetch;
  }, unstable__serverClient2 = {
    instance: void 0,
    canPreviewDrafts: false
  };
  return {
    createFetcherStore,
    enableLiveMode,
    setServerClient: (newClient) => {
      if (runtime !== "server")
        throw new Error(
          "`setServerClient` can only be called in server environments, detected: " + JSON.stringify(runtime)
        );
      if (!ssr)
        throw new Error("`setServerClient` can only be called when `ssr: true`");
      unstable__serverClient2.instance = client2 = cloneClientWithConfig(newClient), unstable__serverClient2.canPreviewDrafts = !!client2.config().token, $fetcher.set(createDefaultFetcher());
    },
    unstable__cache,
    unstable__serverClient: unstable__serverClient2
  };
};
function defineStudioUrlStore(client2) {
  return writable(typeof client2 === "object" ? client2?.config().stega.studioUrl : void 0);
}
function defineUseLiveMode({ enableLiveMode, studioUrlStore }) {
  return ({ allowStudioOrigin, client: client2, onConnect, onDisconnect, studioUrl } = {}) => {
    if (allowStudioOrigin) {
      console.warn("`allowStudioOrigin` is deprecated and no longer needed");
    }
    studioUrlStore.set(studioUrl ?? (typeof client2 === "object" ? client2?.config().stega.studioUrl : void 0));
    return enableLiveMode({
      client: client2,
      onConnect,
      onDisconnect
    });
  };
}
var store2;
function getGlobalMessage(lang) {
  return store2?.get(lang);
}
var store3;
function getSchemaMessage(lang) {
  return store3?.get(lang);
}
var store4;
function getSpecificMessage(reference, lang) {
  return store4?.get(reference)?.get(lang);
}
function _stringify(input) {
  let type = typeof input;
  return type === "object" && (type = (input && Object.getPrototypeOf(input)?.constructor?.name) ?? "null"), type === "string" ? `"${input}"` : type === "number" || type === "bigint" || type === "boolean" ? `${input}` : type;
}
function _addIssue(context, label, dataset, config2, other) {
  const input = other && "input" in other ? other.input : dataset.value, expected = other?.expected ?? context.expects, received = other?.received ?? _stringify(input), issue = {
    kind: context.kind,
    type: context.type,
    input,
    expected,
    received,
    message: `Invalid ${label}: ${expected ? `Expected ${expected} but r` : "R"}eceived ${received}`,
    // @ts-expect-error
    requirement: context.requirement,
    path: other?.path,
    issues: other?.issues,
    lang: config2.lang,
    abortEarly: config2.abortEarly,
    abortPipeEarly: config2.abortPipeEarly,
    skipPipe: config2.skipPipe
  }, isSchema = context.kind === "schema", message = (
    // @ts-expect-error
    context.message ?? getSpecificMessage(context.reference, issue.lang) ?? (isSchema ? getSchemaMessage(issue.lang) : null) ?? config2.message ?? getGlobalMessage(issue.lang)
  );
  message && (issue.message = typeof message == "function" ? message(issue) : message), isSchema && (dataset.typed = false), dataset.issues ? dataset.issues.push(issue) : dataset.issues = [issue];
}
function _isAllowedObjectKey(key) {
  return key !== "__proto__" && key !== "prototype" && key !== "constructor";
}
function minLength(requirement, message) {
  return {
    kind: "validation",
    type: "min_length",
    reference: minLength,
    async: false,
    expects: `>=${requirement}`,
    requirement,
    message,
    _run(dataset, config2) {
      return dataset.typed && dataset.value.length < this.requirement && _addIssue(this, "length", dataset, config2, {
        received: `${dataset.value.length}`
      }), dataset;
    }
  };
}
function getDefault(schema, dataset, config2) {
  return typeof schema.default == "function" ? (
    // @ts-expect-error
    schema.default(dataset, config2)
  ) : (
    // @ts-expect-error
    schema.default
  );
}
function is(schema, input) {
  return !schema._run({ typed: false, value: input }, { abortEarly: true }).issues;
}
function object(entries, message) {
  return {
    kind: "schema",
    type: "object",
    reference: object,
    expects: "Object",
    async: false,
    entries,
    message,
    _run(dataset, config2) {
      const input = dataset.value;
      if (input && typeof input == "object") {
        dataset.typed = true, dataset.value = {};
        for (const key in this.entries) {
          const value2 = input[key], valueDataset = this.entries[key]._run(
            { typed: false, value: value2 },
            config2
          );
          if (valueDataset.issues) {
            const pathItem = {
              type: "object",
              origin: "value",
              input,
              key,
              value: value2
            };
            for (const issue of valueDataset.issues)
              issue.path ? issue.path.unshift(pathItem) : issue.path = [pathItem], dataset.issues?.push(issue);
            if (dataset.issues || (dataset.issues = valueDataset.issues), config2.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          valueDataset.typed || (dataset.typed = false), (valueDataset.value !== void 0 || key in input) && (dataset.value[key] = valueDataset.value);
        }
      } else
        _addIssue(this, "type", dataset, config2);
      return dataset;
    }
  };
}
function optional(wrapped, ...args) {
  const schema = {
    kind: "schema",
    type: "optional",
    reference: optional,
    expects: `${wrapped.expects} | undefined`,
    async: false,
    wrapped,
    _run(dataset, config2) {
      return dataset.value === void 0 && ("default" in this && (dataset.value = getDefault(
        this,
        dataset,
        config2
      )), dataset.value === void 0) ? (dataset.typed = true, dataset) : this.wrapped._run(dataset, config2);
    }
  };
  return 0 in args && (schema.default = args[0]), schema;
}
function record(key, value2, message) {
  return {
    kind: "schema",
    type: "record",
    reference: record,
    expects: "Object",
    async: false,
    key,
    value: value2,
    message,
    _run(dataset, config2) {
      const input = dataset.value;
      if (input && typeof input == "object") {
        dataset.typed = true, dataset.value = {};
        for (const entryKey in input)
          if (_isAllowedObjectKey(entryKey)) {
            const entryValue = input[entryKey], keyDataset = this.key._run(
              { typed: false, value: entryKey },
              config2
            );
            if (keyDataset.issues) {
              const pathItem = {
                type: "record",
                origin: "key",
                input,
                key: entryKey,
                value: entryValue
              };
              for (const issue of keyDataset.issues)
                issue.path = [pathItem], dataset.issues?.push(issue);
              if (dataset.issues || (dataset.issues = keyDataset.issues), config2.abortEarly) {
                dataset.typed = false;
                break;
              }
            }
            const valueDataset = this.value._run(
              { typed: false, value: entryValue },
              config2
            );
            if (valueDataset.issues) {
              const pathItem = {
                type: "record",
                origin: "value",
                input,
                key: entryKey,
                value: entryValue
              };
              for (const issue of valueDataset.issues)
                issue.path ? issue.path.unshift(pathItem) : issue.path = [pathItem], dataset.issues?.push(issue);
              if (dataset.issues || (dataset.issues = valueDataset.issues), config2.abortEarly) {
                dataset.typed = false;
                break;
              }
            }
            (!keyDataset.typed || !valueDataset.typed) && (dataset.typed = false), keyDataset.typed && (dataset.value[keyDataset.value] = valueDataset.value);
          }
      } else
        _addIssue(this, "type", dataset, config2);
      return dataset;
    }
  };
}
function string(message) {
  return {
    kind: "schema",
    type: "string",
    reference: string,
    expects: "string",
    async: false,
    message,
    _run(dataset, config2) {
      return typeof dataset.value == "string" ? dataset.typed = true : _addIssue(this, "type", dataset, config2), dataset;
    }
  };
}
function unknown() {
  return {
    kind: "schema",
    type: "unknown",
    reference: unknown,
    expects: "unknown",
    async: false,
    _run(dataset) {
      return dataset.typed = true, dataset;
    }
  };
}
function pipe(...pipe2) {
  return {
    ...pipe2[0],
    pipe: pipe2,
    _run(dataset, config2) {
      for (let index = 0; index < pipe2.length; index++) {
        dataset = pipe2[index]._run(dataset, config2);
        const nextAction = pipe2[index + 1];
        if (config2.skipPipe || dataset.issues && (config2.abortEarly || config2.abortPipeEarly || // TODO: This behavior must be documented!
        nextAction?.kind === "schema" || nextAction?.kind === "transformation")) {
          dataset.typed = false;
          break;
        }
      }
      return dataset;
    }
  };
}
function isArray(value) {
  return value !== null && Array.isArray(value);
}
function pathToUrlString(path) {
  let str = "";
  for (const segment of path) {
    if (typeof segment == "string") {
      str && (str += "."), str += segment;
      continue;
    }
    if (typeof segment == "number") {
      str && (str += ":"), str += `${segment}`;
      continue;
    }
    if (isArray(segment)) {
      str && (str += ":"), str += `${segment.join(",")}}`;
      continue;
    }
    if (segment._key) {
      str && (str += ":"), str += `${segment._key}`;
      continue;
    }
  }
  return str;
}
const DRAFTS_PREFIX = "drafts.", lengthyStr = pipe(string(), minLength(1)), optionalLengthyStr = optional(lengthyStr), sanityNodeSchema = object({
  baseUrl: lengthyStr,
  dataset: optionalLengthyStr,
  id: lengthyStr,
  path: lengthyStr,
  projectId: optionalLengthyStr,
  tool: optionalLengthyStr,
  type: optionalLengthyStr,
  workspace: optionalLengthyStr,
  isDraft: optional(string())
});
object({
  origin: lengthyStr,
  href: lengthyStr,
  data: optional(record(string(), unknown()))
});
function isValidSanityNode(node) {
  return is(sanityNodeSchema, node);
}
function encodeSanityNodeData(node) {
  const { id: _id, path, baseUrl, tool, workspace, type } = node;
  return isValidSanityNode(node) ? [
    ["id", getPublishedId(_id)],
    ["type", type],
    ["path", pathToUrlString(studioPath.fromString(path))],
    ["base", encodeURIComponent(baseUrl)],
    ["workspace", workspace],
    ["tool", tool],
    ["isDraft", _id.startsWith(DRAFTS_PREFIX)]
  ].filter(([, value]) => !!value).map((part) => {
    const [key, value] = part;
    return value === true ? key : part.join("=");
  }).join(";") : void 0;
}
const encodeDataAttribute = (result, sourceMap, studioUrl, studioPathLike) => {
  if (!sourceMap || !studioUrl)
    return;
  const resultPath = studioPathToJsonPath(studioPathLike), editInfo = resolveEditInfo({
    resultPath,
    resultSourceMap: sourceMap,
    studioUrl
  });
  if (editInfo)
    return encodeSanityNodeData({
      baseUrl: editInfo.baseUrl,
      workspace: editInfo.workspace,
      tool: editInfo.tool,
      type: editInfo.type,
      id: editInfo.id,
      path: typeof editInfo.path == "string" ? editInfo.path : studioPath.toString(jsonPathToStudioPath(editInfo.path))
    });
};
function defineEncodeDataAttribute(result, sourceMap, studioUrl, basePath) {
  const parse = (path) => path ? typeof path == "string" ? studioPath.fromString(path) : path : [], parsedBasePath = parse(basePath);
  return Object.assign(
    (path) => encodeDataAttribute(result, sourceMap, studioUrl, [...parsedBasePath, ...parse(path)]),
    // The scope method creates a scoped version of encodeDataAttribute
    {
      scope: (scope) => defineEncodeDataAttribute(result, sourceMap, studioUrl, [
        ...parsedBasePath,
        ...parse(scope)
      ])
    }
  );
}
function useEncodeDataAttribute(result, sourceMap, studioUrl) {
  return defineEncodeDataAttribute(result, sourceMap, studioUrl);
}
function defineUseQuery({ createFetcherStore, studioUrlStore }) {
  const DEFAULT_PARAMS = {};
  const DEFAULT_OPTIONS = {};
  return (query, params = DEFAULT_PARAMS, options = DEFAULT_OPTIONS) => {
    if (typeof query === "object") {
      params = query.params || DEFAULT_PARAMS;
      options = query.options || DEFAULT_OPTIONS;
      query = query.query;
    }
    const initial = options.initial ? {
      perspective: "published",
      ...options.initial
    } : void 0;
    const $params = JSON.stringify(params);
    const $fetcher = createFetcherStore(query, JSON.parse($params), initial);
    const $writeable = writable($fetcher.value);
    return derived([$writeable, studioUrlStore], ([value, studioUrl]) => ({
      ...value,
      encodeDataAttribute: useEncodeDataAttribute(value.data, value.sourceMap, studioUrl)
    }));
  };
}
const createQueryStore = (options) => {
  const { createFetcherStore, setServerClient: setServerClient2, enableLiveMode, unstable__cache, unstable__serverClient: unstable__serverClient2 } = createQueryStore$1({
    tag: "svelte-loader",
    ...options
  });
  const studioUrlStore = defineStudioUrlStore(options.client);
  const useQuery2 = defineUseQuery({ createFetcherStore, studioUrlStore });
  const useLiveMode2 = defineUseLiveMode({
    enableLiveMode,
    studioUrlStore
  });
  const loadQuery2 = async (query, params = {}, options2 = {}) => {
    const { headers, tag: tag2 } = options2;
    const perspective = options2.perspective || unstable__serverClient2.instance?.config().perspective || "published";
    const stega = options2.stega ?? unstable__serverClient2.instance?.config().stega ?? false;
    if (typeof document !== "undefined") {
      throw new Error("Cannot use `loadQuery` in a browser environment, you should use it inside a load function.");
    }
    if (perspective !== "published" && !unstable__serverClient2.instance) {
      throw new Error(`You cannot use other perspectives than "published" unless call "setServerClient" first.`);
    }
    if (perspective === "previewDrafts") {
      if (!unstable__serverClient2.canPreviewDrafts) {
        throw new Error(`You cannot use "previewDrafts" unless you set a "token" in the "client" instance passed to "setServerClient".`);
      }
      const { result: result2, resultSourceMap: resultSourceMap2 } = await unstable__serverClient2.instance.fetch(query, params, {
        filterResponse: false,
        resultSourceMap: "withKeyArraySelector",
        perspective,
        useCdn: false,
        headers,
        tag: tag2,
        stega
      });
      return { data: result2, sourceMap: resultSourceMap2, perspective };
    }
    const useCdn = options2.useCdn || unstable__serverClient2.instance.config().useCdn;
    const { result, resultSourceMap } = await unstable__cache.instance.fetch(JSON.stringify({ query, params, perspective, useCdn, stega }));
    return resultSourceMap ? { data: result, sourceMap: resultSourceMap } : { data: result };
  };
  return {
    loadQuery: loadQuery2,
    // @ts-expect-error - update typings
    useQuery: useQuery2,
    setServerClient: setServerClient2,
    useLiveMode: useLiveMode2,
    unstable__serverClient: unstable__serverClient2
  };
};
const {
  /** @public */
  loadQuery,
  /** @public */
  setServerClient,
  /** @public */
  useLiveMode,
  /** @public */
  useQuery,
  /** @internal */
  unstable__serverClient
} = createQueryStore({
  client: false,
  ssr: true
});
function sequence(...handlers) {
  const length = handlers.length;
  if (!length) return ({ event, resolve }) => resolve(event);
  return ({ event, resolve }) => {
    return apply_handle(0, event, {});
    function apply_handle(i, event2, parent_options) {
      const handle2 = handlers[i];
      return handle2({
        event: event2,
        resolve: (event3, options) => {
          const transformPageChunk = async ({ html, done }) => {
            if (options?.transformPageChunk) {
              html = await options.transformPageChunk({ html, done }) ?? "";
            }
            if (parent_options?.transformPageChunk) {
              html = await parent_options.transformPageChunk({ html, done }) ?? "";
            }
            return html;
          };
          const filterSerializedResponseHeaders = parent_options?.filterSerializedResponseHeaders ?? options?.filterSerializedResponseHeaders;
          const preload = parent_options?.preload ?? options?.preload;
          return i < length - 1 ? apply_handle(i + 1, event3, {
            transformPageChunk,
            filterSerializedResponseHeaders,
            preload
          }) : resolve(event3, { transformPageChunk, filterSerializedResponseHeaders, preload });
        }
      });
    }
  };
}
const handleLoadQuery = ({ client: _client, loadQuery: loadQuery$1 }) => async ({ event, resolve }) => {
  const client2 = _client || event.locals.client;
  if (!client2)
    throw new Error("No client instance provided to handleLoadQuery");
  const lq = loadQuery$1 || loadQuery;
  const { perspective, useCdn } = client2.config();
  event.locals.loadQuery = (query, params, options = {}) => {
    const stega = event.locals.preview ? options.stega : false;
    return lq(query, params, {
      ...options,
      perspective,
      useCdn,
      stega
    });
  };
  return await resolve(event);
};
const createRequestHandler = ({ preview, loadQuery: loadQuery2 } = {}) => {
  const client2 = preview?.client || unstable__serverClient.instance;
  if (!client2)
    throw new Error("No Sanity client configured for preview");
  return sequence(handlePreview({ client: client2, preview }), handleLoadQuery({ loadQuery: loadQuery2 }));
};
const SANITY_API_READ_TOKEN = "skBTP3ZLveW3CyEiUnhej45u76aYfQtT0x6gXBmjAqtfH9xTXXFVuFg6Lpv5ENpWaBX4z5FSaxPLgz2h7GGFgeO73dsji16JcplPuPwJDhskhCdAmmaCyvooYT8BSKOXeJ5qOceNZRQzDD6jISOrc1Lk2F6EylzbD2vKzylinOQQl35LgSPS";
const token = assertEnvVar(SANITY_API_READ_TOKEN, "SANITY_API_READ_TOKEN");
const serverClient = client.withConfig({
  token,
  useCdn: false,
  stega: true
});
setServerClient(serverClient);
const handle = createRequestHandler();
const hooks_server = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  handle
}, Symbol.toStringTag, { value: "Module" }));
export {
  atom as a,
  hooks_server as h
};
