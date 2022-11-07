export default function focusTerminal() {
  setTimeout(function () {
    const input = document.querySelector(
      "#terminal input"
    ) as HTMLElement | null;

    const terminal = document.getElementById("terminal");

    if (input) {
      input.focus();
      return;
    }

    terminal?.focus();
  }, 0);
}
