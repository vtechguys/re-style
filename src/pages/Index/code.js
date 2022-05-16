import { StyleSheet } from "../../re-style";

export const exampleCode = `import { StyleSheet } from "re-style";

const classes = {
  container: {
    height: '400px',
    borderWidth: '1px',
    borderColor: 'red',
    borderStyle: 'solid'
  },
  row: {
    display: 'flex',
    flexDirection: 'row'
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    paddingTop: '20px',
    paddingRight: '20px',
    paddingBottom: '20px',
    paddingLeft: '20px',
    backgroudColor: "black",
    color: "white"
  }
};

function App() {
  return (
    <div className={StyleSheet.resolve(classes.container, classes.row, classes.center)}>
      <div className={StyleSheet.resolve(classes.box)}>
        Box
      </div>
    </div>
  );
}
`;

const classes = {
  container: {
    height: "400px",
    borderWidth: "1px",
    borderColor: "red",
    borderStyle: "solid"
  },
  row: {
    display: "flex",
    flexDirection: "row"
  },
  center: {
    justifyContent: "center",
    alignItems: "center"
  },
  box: {
    paddingTop: "20px",
    paddingRight: "20px",
    paddingBottom: "20px",
    paddingLeft: "20px",
    backgroundColor: "black",
    color: "white",
    fontSize: "24px"
  }
};

export function Example() {
  return (
    <div
      className={StyleSheet.resolve(
        classes.container,
        classes.row,
        classes.center
      )}
    >
      <div className={StyleSheet.resolve(classes.box)}>Box</div>
    </div>
  );
}
