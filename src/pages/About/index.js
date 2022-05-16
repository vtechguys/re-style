import { StyleSheet } from "../../re-style";
const classes = {
  m0: {
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 0
  },
  page: {
    paddingLeft: 10,
    paddingRight: 10
  }
};
export default function Page() {
  return <h1 className={StyleSheet.resolve(classes.m0)}>About</h1>;
}
