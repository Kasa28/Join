
document.addEventListener('DOMContentLoaded', function () {
  const menuWrapper = document.querySelector('.contact-actions-mobile');
  const toggle = document.getElementById('contact-menu-toggle');
  if (!menuWrapper || !toggle) return;

  document.addEventListener('click', function (event) {
    if (!menuWrapper.contains(event.target)) {
      toggle.checked = false;
    }
  });
});

// === Toast (GLOBAL) ===
function showToast(text, { variant = "ok", duration = 1000 } = {}) {
  let root = document.getElementById("toast-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "toast-root";
    document.body.appendChild(root);
  }
  const el = document.createElement("div");
  el.className =
    "toast toast--show" + (variant === "error" ? " toast--error" : "");
  el.innerHTML = `<span>${text}</span><span class="toast-icon" aria-hidden="true"></span>`;
  root.appendChild(el);

  setTimeout(() => {
    el.classList.remove("toast--show");
    el.classList.add("toast--hide");
    el.addEventListener("animationend", () => el.remove(), { once: true });
  }, duration);
}
