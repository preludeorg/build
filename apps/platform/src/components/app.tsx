import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Build from "@theprelude/build";
import { authState } from "@theprelude/core";
import { Notifications } from "@theprelude/ds";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Header from "./header/header";
import Nav from "./nav/nav";
import styles from "./platform.module.css";
import ReloadPrompt from "./reload-prompt/reload-prompt";

const router = createBrowserRouter([
  {
    path: "/",
    loader: () => {
      void authState().initialize();
      return true;
    },
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
      <ReloadPrompt />
    </QueryClientProvider>
  );
}

export default Platform;
