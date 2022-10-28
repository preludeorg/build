import styles from "./app.module.css";
import Terminal from "./terminal/terminal";
import ConnectedServer from "./servers/connected-server";
import Navbar from "./navbar/navbar";
import Welcome from "./welcome/welcome";
import EditorPanel from "./editor/editor-panel";
import useNavigationStore from "../hooks/navigation-store";
import Servers from "./servers/servers";
import shallow from "zustand/shallow";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  const { navigate, panel, serverPanelVisible, toggleServerPanel } =
    useNavigationStore((state) => state, shallow);
  return (
    <QueryClientProvider client={queryClient}>
      <div className={styles.app}>
        <ConnectedServer />
        <Navbar
          navigation={panel}
          setNavigation={navigate}
          toggleServerPanel={toggleServerPanel}
        />
        <main>
          <section>
            {panel === "welcome" && <Welcome />}
            {panel === "editor" && <EditorPanel />}
          </section>
          <footer>
            <Terminal />
          </footer>
        </main>
        {serverPanelVisible && (
          <Servers toggleServerPanel={toggleServerPanel} />
        )}
      </div>
    </QueryClientProvider>
  );
}

export default App;
