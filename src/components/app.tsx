import Swift from "../lib/lang/swift";
import styles from "./app.module.css";
import Terminal from "./terminal/terminal";
import ConnectedServer from "./servers/connected-server";
import Navbar from "./navbar/navbar";
import Welcome from "./welcome/welcome";
import useEditorStore from "../hooks/editor-store";
import EditorPanel from "./editor/editor-panel";
import useNavigationStore from "../hooks/navigation-store";
import Servers from "./servers/servers";
import { z, ZodError } from "zod";
import useAuthStore from "../hooks/auth-store";
import shallow from "zustand/shallow";

function App() {
  const { navigate, panel, serverPanelVisible, toggleServerPanel } =
    useNavigationStore((state) => state, shallow);
  const createAccount = useAuthStore((state) => state.createAccount);
  const openTab = useEditorStore((state) => state.openTab);
  return (
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
          <Terminal
            commands={{
              login: async (args) => {
                try {
                  const email = z.string().email().parse(args);
                  const { host } = await createAccount(email);

                  return (
                    <>
                      <br />
                      Connected to {host}
                      <br />
                      <br />
                      Type “help” for a list of commands <br />
                    </>
                  );
                } catch (e) {
                  if (e instanceof ZodError) {
                    return e.errors[0].message;
                  } else {
                    return (e as Error).message;
                  }
                }
              },
              "list-manifest": () => {
                return `command not implemented`;
              },
              search: () => {
                return `command not implemented`;
              },
              open: () => {
                navigate("editor");
                const filename = `linux-${Date.now()}-x84.swift`;
                openTab({
                  name: filename,
                  code: new Swift().bootstrap(),
                });

                return `opened ${filename} in editor`;
              },
            }}
          />
        </footer>
      </main>
      {serverPanelVisible && <Servers toggleServerPanel={toggleServerPanel} />}
    </div>
  );
}

export default App;
