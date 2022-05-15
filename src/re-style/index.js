import { init } from "./StyleSheet";
import { BREAKPOINTS, STYLESHEET_ID } from "./constants";

const { StyleSheet, StyleRegistry } = init({
  breakpoints: BREAKPOINTS,
  id: STYLESHEET_ID
});

export { BREAKPOINTS, STYLESHEET_ID } from "./constants";
export { StyleSheet, StyleRegistry, init };
