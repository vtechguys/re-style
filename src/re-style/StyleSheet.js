import {
  isNill,
  isString,
  createObject,
  isObject,
  tail,
  merge,
  toHyphenCase
} from "./utils";
import { INVALID_SHORT_HAND_PROPERTIES } from "./constants";

/** style sheet  */
let _id_;
let uid = 1;
let _breakpoints_ = createObject();

const cache = new Map();

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
  const _base_rule_ = makeRule(`.${className}`, cssProp, value, breakpoint);
  if (!shouldInjectIntoStyleSheet(element, className)) {
    if (_breakpoints_[breakpoint]) {
      element.innerHTML += `${_breakpoints_[breakpoint]} { ${_base_rule_} }`;
    } else {
      element.innerHTML += _base_rule_;
    }
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

const createRegistry = (name) => {
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
  const set = (style) => {
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
                breakpointValue
              );
            }
          }
        } else {
          // record variants of this css_prop

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
  };

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

  // set global_registry as global
  // update global_registry if required
  if (isObject(window)) {
    const as = `__${name}__`;
    window[as] = merge(global_registry, window[as]);
  }

  return {
    set,
    get,
    getRegistry
  };
};

/// MAIN
export const init = ({ breakpoints, id }) => {
  // initialize breakpoints and id
  _breakpoints_ = breakpoints;
  _id_ = id;
  // create breakpoint specific stylesheet
  // this could be used to import css dynamically
  for (const breakpoint in _breakpoints_) {
    if (Object.prototype.hasOwnProperty.call(breakpoint, _breakpoints_)) {
      getStyleElement(`${breakpoint}:${_id_}`);
    }
  }

  if (isObject(window)) {
    window[`__${id}__`] = cache;
  }

  const StyleRegistry = createRegistry("StyleRegistry");
  // get a style sheet object { [className]: { color: 'red' } }

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

  const resolve = (...styles) => {
    const merged_styles = merge(...styles);
    return StyleRegistry.get(merged_styles);
  };

  const StyleSheet = {
    create,
    resolve
  };

  return {
    StyleSheet,
    StyleRegistry
  };
};
