/** common utils */
export const isObject = (v) => v && typeof v === "object";
export const isArray = (v) => Array.isArray(v);
export const isMergeableObject = (v) => isObject(v) && !isArray(v);
export const isString = (v) => typeof v === "string";
export const isUndefined = (v) => typeof v === "undefined";
export const isNull = (v) => v === null;
export const isNill = (v) => isUndefined(v) || isNull(v);
export const toLowerCase = (v) => v.toLowerCase();
const toHyphenCase = (v) =>
  v.replace(/[A-Z]/g, (letter) => `-${toLowerCase(letter)}`);
const replaceOnlySpaces = (str) => str.replace(/  +/g, " ");
const tail = (str) => replaceOnlySpaces(str.trim());
const createObject = () => Object.create(null);
// unoptimised
const merge = (target, ...sources) => {
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
/** constants */
export const INVALID_SHORT_HAND_PROPERTIES = {
  margin: true,
  padding: true,
  border: true,
  background: true,
  borderColor: true,
  borderStyle: true,
  borderWidth: true,
  overflow: true,
  overscollBehavior: true
};

export const BREAKPOINTS = {
  xs: "@media only screen and (max-width: 425px)",
  sm: "@media only screen and (min-width: 425px)",
  md: "@media only screen and (min-width: 768px)",
  lg: "@media only screen and (min-width: 920px)",
  xl: "@media only screen and (min-width: 1200px)",
  xxl: "@media only screen and (min-width: 1400px)"
};

export const STYLESHEET_ID = "re-style";

/**
 * StyleSheet utils.js
 */

const getStyleElement = (id) => {
  let element = document.getElementById(id);
  if (isNill(element)) {
    element = document.createElement("style");
    element.setAttribute("id", id);
    if (document?.head) {
      document.head.insertBefore(element, document.head.firstChild);
    }
  }
  return element;
};

// records the styles which has been pushed into the style-tag/stylesheet
const cache = new Map();
const makeRule = (selector, css_prop, value, breakpoint) => {
  const _baseRule_ = `${selector} { ${css_prop}: ${value}; } \n`;
  let rule = _baseRule_;
  if (breakpoint) {
    rule = `${_breakpoints_[breakpoint]} { ${_baseRule_} }\n`;
  }
  return rule;
};

const shouldInjectIntoStyleSheet = (element, className) =>
  (element && cache.get(className)) || false;

// document.getElementById(style-id).sheet.insertRule() might be better choice
const injectIntoStyleSheet = (
  element,
  className,
  cssProp,
  value,
  breakpoint
) => {
  if (!shouldInjectIntoStyleSheet(element, className)) {
    const _base_rule_ = makeRule(`.${className}`, cssProp, value, breakpoint);
    element.innerHTML += _base_rule_;
    cache.set(className, true);
  }
};

// we need to make sure class-name is function of prop, value, breakpoint
// uid may lead to conflict dynamically loaded modules
const getClassName = (prop, value, breakpoint) =>
  `${breakpoint ? `${breakpoint}_` : ""}${prop}--${uid++}`;
const validateCSSPropValue = (prop, value) => {
  if (INVALID_SHORT_HAND_PROPERTIES[prop]) {
    console.error(`Shorthand property "${prop}" is not valid.`);
  }
  if (isString(value) && value.includes("!important")) {
    console.error(
      `"!important" is not allowed, found in declaration "${prop}: ${value}"`
    );
  }
};

let _id_;
let uid = 1;
const empty_object = createObject();
let _breakpoints_ = createObject();

const createRegistry = () => {
  // records all styles
  const global_registry = createObject();
  // for each breakpoint we have separate stylesheet
  // each stylesheet map is keyed by its breakpoint name
  // a stylesheet map records variant of css_prop
  // for css_prop without breakpoint
  global_registry.global = createObject();
  for (const breakpoint in _breakpoints_) {
    if (Object.prototype.hasOwnProperty.call(_breakpoints_, breakpoint)) {
      global_registry[breakpoint] = createObject();
    }
  }

  // registry instance methods

  // for the style object make entry for each style property in registery
  // and insert into sytle-tags. each property is converted and inserted
  // as atomic class in style sheet
  const set = (style) => {
    let out = style || empty_object;
    // style are required to be objects
    // { [css_prop]: value }
    // { color: 'red' }
    if (isObject(style)) {
      for (const cssProp in style) {
        if (!Object.prototype.hasOwnProperty.call(style, cssProp)) {
          continue;
        }

        // a value can be simple primitive
        // or a object of breakpoints-value
        // a breakpoint value may look like
        // { [screen]: val }
        // { sm: 'red', md: 'blue' }
        const value = style[cssProp];

        // css properties are hypen-cased
        const css_prop = toHyphenCase(cssProp);

        // verify the validity of styles in non-production env
        // in production env this piece of code will be removed by webpack
        validateCSSPropValue(cssProp, value);
        // if (process?.env?.NODE_ENV !== "production") {
        // }

        // it has breakpoint value
        if (isObject(value)) {
          const breakpointValues = value;
          for (const breakpoint in breakpointValues) {
            // make sure this is a valid breakpoint
            if (!_breakpoints_[breakpoint]) {
              continue;
            }

            let breakpoint_registry = global_registry[breakpoint];
            // make sure map exist
            if (!breakpoint_registry) {
              global_registry[breakpoint] = createObject();
              breakpoint_registry = global_registry[breakpoint];
            }

            const breakpointValue = value[breakpoint];
            // record variants of this css_prop
            let propVariantMap = breakpoint_registry[css_prop];
            if (!propVariantMap) {
              breakpoint_registry[css_prop] = createObject();
              propVariantMap = breakpoint_registry[css_prop];
            }

            // register new variant
            if (isNill(propVariantMap[breakpointValue])) {
              propVariantMap[breakpointValue] = getClassName(
                css_prop,
                breakpointValue,
                breakpoint
              );
              /**
               * is it even a good strategy to inject at this point of time?
               */
              injectIntoStyleSheet(
                getStyleElement(`${breakpoint}:${_id_}`),
                propVariantMap[breakpointValue],
                css_prop,
                breakpointValue,
                breakpoint
              );
            }
          }
        } else {
          // prop has primitive value
          // record this value as a variant of this css_prop
          let propVariantMap = global_registry.global[css_prop];
          // register variant to stylesheet
          if (isNill(global_registry.global[css_prop])) {
            global_registry.global[css_prop] = createObject();
            propVariantMap = global_registry.global[css_prop];
          }
          // register new variant
          if (isNill(propVariantMap?.[value])) {
            propVariantMap[value] = getClassName(css_prop, value);
            injectIntoStyleSheet(
              getStyleElement(_id_),
              propVariantMap[value],
              css_prop,
              value
            );
          }
        }
      }
    }
    return out;
  };
  // gets atomic classnames for style object
  const get = (style) => {
    let className = "";

    for (const cssProp in style) {
      if (!Object.prototype.hasOwnProperty.call(style, cssProp)) {
        continue;
      }
      // cssProp are hyphen cased
      const value = style[cssProp];
      const css_prop = toHyphenCase(cssProp);

      // both property name and value must be valid
      if (isNill(value)) {
        continue;
      }
      // value is primitive so it must be on global stylesheet map
      if (!isObject(value)) {
        if (global_registry.global?.[css_prop]?.[value]) {
          className += ` ${global_registry.global[css_prop][value]}`;
        }
      } else {
        // value is breakpoint map
        const breakpointValues = value;
        // for the declared breakpoints get registered classnames
        for (const breakpoint in breakpointValues) {
          if (
            !Object.prototype.hasOwnProperty.call(breakpointValues, breakpoint)
          ) {
            continue;
          }
          // breakpoint is not a registered breakpoint
          if (!_breakpoints_[breakpoint]) {
            continue;
          }

          const breakpointValue = breakpointValues[breakpoint];
          if (global_registry[breakpoint]?.[css_prop]?.[breakpointValue]) {
            const breakpointsClassName =
              global_registry[breakpoint][css_prop][breakpointValue];
            if (breakpointsClassName) {
              className += ` ${breakpointsClassName}`;
            }
          }
        }
      }
    }

    return tail(className);
  };

  const getRegistry = () => global_registry;

  return {
    set,
    get,
    getRegistry
  };
};

/// create re-style instance
export const createInstance = (config) => {
  // initialize breakpoints and id
  _breakpoints_ = config.breakpoints;
  _id_ = config.id;
  // create breakpoint specific stylesheet
  // this could be used to import css dynamically
  // as <link media="breakpoints" />
  for (const breakpoint in _breakpoints_) {
    if (Object.prototype.hasOwnProperty.call(breakpoint, _breakpoints_)) {
      getStyleElement(`${breakpoint}:${_id_}`);
    }
  }
  // create style registery
  const StyleRegistry = createRegistry("StyleRegistry");

  if (isObject(window)) {
    const as = `__${config.id}_STYLE_REGISTRY__`;
    // can this merging break for dynamic loaded modules ??
    window[as] = merge(window[as], StyleRegistry.getRegistry());
  }

  if (isObject(window)) {
    const as = `__${config.id}_CACHE__`;
    // can this merging break for dynamic loaded modules ??
    window[as] = merge(window[as], cache);
  }

  // gets a style sheet object { [className]: { color: 'red' } }
  const create = (stylesheet) => {
    // traverse over the classes
    // and create classname for each css property
    for (const className in stylesheet) {
      if (Object.prototype.hasOwnProperty.call(stylesheet, className)) {
        StyleRegistry.set(stylesheet[className]);
      }
    }

    return stylesheet;
  };
  // compiles all style objects into one
  // gets classnames for compiled style object
  const resolve = (...styles) => {
    let style;
    if (styles.length === 1) {
      style = styles[0];
    } else {
      style = merge(createObject(), ...styles);
    }
    StyleRegistry.set(style);
    return StyleRegistry.get(style);
  };

  // StyleSheet utils
  const StyleSheet = {
    create,
    resolve
  };

  // instance
  return {
    StyleSheet,
    StyleRegistry
  };
};
