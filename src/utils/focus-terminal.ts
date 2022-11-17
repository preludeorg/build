export default function focusTerminal() {
  setTimeout(function () {
    const input = document.querySelector(
      "#terminal input:not(:read-only)"
    ) as HTMLElement | null;

    const terminal = document.getElementById("terminal");

    if (input) {
      input.focus();
      return;
    }

    terminal?.focus();
  }, 0);
}
