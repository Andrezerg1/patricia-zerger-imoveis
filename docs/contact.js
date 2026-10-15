'use strict';
let whatsappNumber = '';
let contactUnavailable = false;
const generalMessage = 'Olá, Patricia! Gostaria de conversar com você.';
function whatsappUrl(number, message = generalMessage) {
 if (!/^[1-9][0-9]{9,14}$/.test(number)) throw new Error('Contato indisponível no momento.');
 return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
function configureWhatsAppLink(link, message = generalMessage) {
 link.dataset.message = message;
 if (whatsappNumber) {
  link.href = whatsappUrl(whatsappNumber, message);
  link.removeAttribute('aria-disabled');
 } else {
  link.removeAttribute('href');
  link.setAttribute('aria-disabled', 'true');
  if (contactUnavailable) link.textContent = 'WhatsApp indisponível no momento';
 }
}
async function loadContact() {
 try {
  const response = await fetch('api/settings.php', {cache:'no-store'});
  if (!response.ok) throw new Error('contact');
  const settings = await response.json();
  whatsappUrl(settings.whatsapp);
  whatsappNumber = settings.whatsapp;
 } catch {
  contactUnavailable = true;
  const status = document.querySelector('#contact-status');
  status.textContent = 'Tente novamente mais tarde.';
  status.hidden = false;
 }
 document.querySelectorAll('[data-whatsapp]').forEach(link => configureWhatsAppLink(link, link.dataset.message || generalMessage));
}
loadContact();

// Reveal the shortcut once the visitor scrolls into the second section.
const floatingContact = document.querySelector('.whatsapp-float');
const contactStartSection = document.querySelector('.search-section');
if (floatingContact && contactStartSection) {
 floatingContact.hidden = false;
 const updateFloatingContact = () => {
  const visible = window.scrollY > 0 && contactStartSection.getBoundingClientRect().top < window.innerHeight;
  floatingContact.classList.toggle('is-visible', visible);
 };
 window.addEventListener('scroll', updateFloatingContact, {passive:true});
 window.addEventListener('resize', updateFloatingContact);
 window.addEventListener('pageshow', updateFloatingContact);
 updateFloatingContact();
}
