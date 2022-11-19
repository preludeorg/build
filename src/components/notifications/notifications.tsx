import toast, { Toaster } from "react-hot-toast";

export const notify = (msg: string) => toast(msg);
export const notifySuccess = (msg: string) => toast.success(msg);
export const notifyError = (msg: string, error?: unknown) =>
  toast.error(error ? `${msg}. Reason: ${(error as Error).message}` : msg);

export function Notifications() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: "var(--color-secondary-30)",
          color: "var(--white)",
          border: "1px solid var(--color-secondary-10)",
        },
        success: {
          iconTheme: {
            primary: "var(--color-success)",
            secondary: "var(--white)",
          },
        },
        error: {
          iconTheme: {
            primary: "var(--color-error)",
            secondary: "var(--white)",
          },
        },
        loading: {
          iconTheme: {
            primary: "var(--color-primary-10)",
            secondary: "var(--white)",
          },
        },
      }}
    />
  );
}
