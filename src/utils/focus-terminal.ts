export default function focusTerminal() {
  setTimeout(function () {
    const input = document.querySelector(
      "#terminal .focusable"
    ) as HTMLElement | null;

    if (input && document.activeElement !== input) {
      input.focus();
    }
  }, 0);
}
