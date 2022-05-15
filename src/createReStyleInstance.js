import { init, STYLESHEET_ID } from "./re-style";
const { StyleSheet } = init({
  breakpoints: {
    xs: "@media only screen and (max-width: 425px)",
    sm: "@media only screen and (min-width: 425px)",
    md: "@media only screen and (min-width: 768px)",
    lg: "@media only screen and (min-width: 920px)",
    xl: "@media only screen and (min-width: 1200px)",
    xxl: "@media only screen and (min-width: 1400px)"
  },
  id: STYLESHEET_ID
});
export { StyleSheet };
