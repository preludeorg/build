import Build from "@theprelude/build";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Header from "./header/header";
import Nav from "./nav/nav";
import styles from "./platform.module.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Build />,
    errorElement: <Build />,
    children: [
      {
        path: "/build",
        element: <Build />,
      },
    ],
  },
]);

function Platform() {
  return (
    <div className={styles.platform}>
      <Header />
      <Nav />
      <main className={styles.wrapper}>
        <RouterProvider router={router} />
      </main>
    </div>
  );
}

export default Platform;
