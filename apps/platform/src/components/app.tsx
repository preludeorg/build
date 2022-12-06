import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Build from "@theprelude/build";
import Welcome from "@theprelude/welcome";
import { createBrowserRouter, Outlet } from "react-router-dom";
import Header from "./header/header";
import Nav from "./nav/nav";
import styles from "./platform.module.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className={styles.platform}>
        <Header />
        <Nav />
        <main className={styles.wrapper}>
          <Outlet />
        </main>
      </div>
    </QueryClientProvider>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { path: "", element: <Welcome /> },
      {
        path: "/build",
        element: <Build />,
      },
    ],
  },
]);

export default router;
