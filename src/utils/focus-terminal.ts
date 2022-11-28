export default function focusTerminal() {
  setTimeout(function () {
    if (window.getSelection()?.type === "Range") {
      return;
    }

    const input = document.querySelector(
      "#terminal .focusable"
    ) as HTMLElement | null;

    if (input) {
      input.focus({ preventScroll: true });
    }
  }, 0);
}
