import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Build from "@theprelude/build";
import Welcome from "@theprelude/welcome";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function Platform() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className={styles.platform}>
        <Header />
        <Nav />
        <main className={styles.wrapper}>
          <Welcome />
          <RouterProvider router={router} />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default Platform;
