import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import buildTheme from "@theprelude/build/theme.module.css";
import { authState } from "@theprelude/core";
import {
  Loading,
  Notifications,
  themeStore,
  useThemeStore,
} from "@theprelude/ds";
import welcomeTheme from "@theprelude/welcome/theme.module.css";
import classNames from "classnames";
import React, { Suspense } from "react";
import { createBrowserRouter, Outlet } from "react-router-dom";
import Banner from "./banner/banner";
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
  const currentApp = useThemeStore((state) => state.currentApp);
  console.log(welcomeTheme);
  return (
    <QueryClientProvider client={queryClient}>
      <div
        className={classNames(styles.page, {
          [buildTheme.page]: currentApp === "build",
          [welcomeTheme.page]: currentApp === "welcome",
        })}
      >
        <Banner />
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
      </div>
      <ReloadPrompt />
    </QueryClientProvider>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    loader: () => {
      void authState().initialize();
      return true;
    },
    children: [
      {
        path: "",
        loader: () => {
          themeStore().setCurrentApp("welcome");
          return true;
        },
        element: <Welcome />,
      },
      {
        path: "/build",
        loader: () => {
          themeStore().setCurrentApp("build");
          return true;
        },
        element: <Build />,
      },
    ],
  },
]);

export default router;
