import { StyleSheet } from "../../re-style";
import { exampleCode, Example } from "./code";
import { m0 } from "../../core/styles";

const classes = {
  mt: {
    marginTop: "10px"
  },
  container: {
    backgroundColor: "#f2c2f2"
  },
  overflowX: {
    overflowX: "scroll"
  },
  code: {
    paddingTop: "10px",
    paddingBottom: "10px",
    paddingLeft: "15px",
    paddingRight: "15px"
  },
  exampleContainer: {
    paddingTop: "10px",
    paddingRight: "10px",
    paddingBottom: "10px",
    paddingLeft: "10px"
  },
  outputLabel: {
    marginBottom: "10px"
  }
};

function CodeBlock(props) {
  return (
    <div className={StyleSheet.resolve(classes.container, classes.overflowX)}>
      <pre className={StyleSheet.resolve(classes.code, props.nowrap, m0)}>
        {props.code}
      </pre>
    </div>
  );
}

export default function Page() {
  return (
    <div>
      <div className={StyleSheet.resolve(classes.mt)}>
        <CodeBlock code={exampleCode} />
      </div>
      <div className={StyleSheet.resolve(classes.exampleContainer)}>
        <p className={StyleSheet.resolve(m0, classes.outputLabel)}>Output:</p>
        <Example />
      </div>
    </div>
  );
}
