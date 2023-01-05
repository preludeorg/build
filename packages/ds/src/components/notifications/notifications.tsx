import toast, { Toaster } from "react-hot-toast";

export const notify = (msg: string) => toast(msg);
export const notifyLoading = (msg: string, id?: string) =>
  toast.loading(msg, { id });
export const dismissNotify = (id?: string) => toast.dismiss(id);
export const notifySuccess = (msg: string, id?: string) =>
  toast.success(msg, { id });
export const notifyError = (msg: string, error?: unknown, id?: string) =>
  toast.error(error ? `${msg}. Reason: ${(error as Error).message}` : msg, {
    id,
  });

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
