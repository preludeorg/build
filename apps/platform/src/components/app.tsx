import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loading, Notifications } from "@theprelude/ds";
import React, { Suspense } from "react";
import { createBrowserRouter, Outlet } from "react-router-dom";
import Header from "./header/header";
import Nav from "./nav/nav";
import styles from "./platform.module.css";
import ReloadPrompt from "./reload-prompt/reload-prompt";

const Build = React.lazy(() => import("@theprelude/build"));
const Welcome = React.lazy(() => import("@theprelude/welcome"));

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
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </main>
        <Notifications />
      </div>
      <ReloadPrompt />
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
