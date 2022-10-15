function htmlToElement(html) {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content.firstElementChild;
}

function hideElements(selector) {
  document.querySelectorAll(selector).forEach(el => el.style.display = "none")
}

function showElements(selector) {
  document.querySelectorAll(selector).forEach(el => el.style.display = "")
}


export { htmlToElement, hideElements, showElements }
