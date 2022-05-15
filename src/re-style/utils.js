export const isObject = (v) => v && typeof v === "object";
export const isArray = (v) => Array.isArray(v);
export const isMergeableObject = (v) => isObject(v) && !isArray(v);
export const isString = (v) => typeof v === "string";
export const isUndefined = (v) => typeof v === "undefined";
export const isNull = (v) => v === null;
export const isNill = (v) => isUndefined(v) || isNull(v);
export const toLowerCase = (v) => v.toLowerCase();
export const toHyphenCase = (v) =>
  v.replace(/[A-Z]/g, (letter) => `-${toLowerCase(letter)}`);
export const replaceOnlySpaces = (str) => str.replace(/  +/g, " ");
export const tail = (str) => replaceOnlySpaces(str.trim());
export const createObject = () => Object.create(null);
export const merge = (target, ...sources) => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isMergeableObject(target) && isMergeableObject(source)) {
    for (const key in source) {
      if (isMergeableObject(source[key])) {
        if (!target[key])
          Object.assign(target, {
            [key]: {}
          });
        merge(target[key], source[key]);
      } else {
        Object.assign(target, {
          [key]: source[key]
        });
      }
    }
  }

  return merge(target, ...sources);
};
