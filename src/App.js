import { lazy, Suspense } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { StyleSheet } from "./re-style";
import { m0, page } from "./core/styles";
import IndexPage from "./pages/Index";
const AboutPage = lazy(() => import("./pages/About"));

const classes = {
  app: {
    height: "calc(100vh)"
  },
  row: {
    display: "flex",
    flexDirection: "row"
  },
  center: {
    justifyContent: "space-between",
    alignItems: "center"
  },
  header: {}
};

export default function App() {
  return (
    <div className={StyleSheet.resolve(classes.app)}>
      <div
        className={StyleSheet.resolve(classes.row, classes.center, page.header)}
      >
        <h2 className={StyleSheet.resolve(m0)}>Re-Style</h2>
        <Link to="/about">About</Link>
      </div>
      <main className={StyleSheet.resolve(page.main)}>
        <Suspense fallback={<h1>Loading</h1>}>
          <Routes>
            <Route path="/about" element={<AboutPage />} />
            <Route path="/" element={<IndexPage />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
