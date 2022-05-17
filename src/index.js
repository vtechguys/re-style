import { createInstance, BREAKPOINTS, STYLESHEET_ID } from "./StyleSheet";

const { StyleSheet, StyleRegistry } = createInstance({
  breakpoints: BREAKPOINTS,
  id: STYLESHEET_ID
});

export {
  StyleSheet,
  StyleRegistry,
  createInstance,
  BREAKPOINTS,
  STYLESHEET_ID
};
