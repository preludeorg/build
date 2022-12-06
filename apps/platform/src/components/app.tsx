import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Build from "@theprelude/build";
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

function Platform() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className={styles.platform}>
        <Header />
        <Nav />
        <main className={styles.wrapper}>
          <Build />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default Platform;
