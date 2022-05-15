import { StyleSheet } from "./createReStyleInstance";
const classes = StyleSheet.create({
  container: {
    height: "calc(100vh)",
    textAlign: {
      xs: "center",
      xxl: "left-align"
    }
  },
  backgroundGrey: {
    backgroundColor: "grey"
  },
  h1: {
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 0
  }
});

export default function App() {
  return (
    <div
      className={StyleSheet.resolve(classes.container, classes.backgroundGrey)}
    >
      <h1 className={StyleSheet.resolve(classes.h1)}>Hello 1</h1>
      <h2>Start editing to see some magic happen!</h2>
    </div>
  );
}
