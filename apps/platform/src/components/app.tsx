import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Build from "@theprelude/build";
import { Notifications } from "@theprelude/ds";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Header from "./header/header";
import Nav from "./nav/nav";
import styles from "./platform.module.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Build />,
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
          <RouterProvider router={router} />
        </main>
        <Notifications />
      </div>
    </QueryClientProvider>
  );
}

export default Platform;
