'use strict';
const $ = (selector, root = document) => root.querySelector(selector);
const money = value => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

let toastTimer;
function notify(message) {
 const node = $('#toast'); node.textContent = message; node.hidden = false;
 clearTimeout(toastTimer); toastTimer = setTimeout(() => node.hidden = true, 6500);
}
document.querySelectorAll('[data-close]').forEach(button => button.onclick = () => button.closest('dialog').close());
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => {
 const box = dialog.getBoundingClientRect();
 if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
}));
