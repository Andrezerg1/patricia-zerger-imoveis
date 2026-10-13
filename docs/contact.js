'use strict';

function whatsappUrl(number, fields) {
 if (!/^[1-9][0-9]{9,14}$/.test(number)) throw new Error('Contato indisponível no momento. Tente novamente mais tarde.');
 const message = `Olá, Patricia! Meu nome é ${fields.name.trim()}.\nContato: ${fields.contact.trim()}\n\n${fields.message.trim()}`;
 return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

let whatsappNumber = '';
const contactForm = document.querySelector('#contact-form');
const contactButton = contactForm.querySelector('[type="submit"]');
const contactStatus = document.querySelector('#contact-status');
const whatsappLink = document.querySelector('#whatsapp-link');

async function loadContact() {
 try {
  const response = await fetch('api/settings.php', {cache:'no-store'});
  if (!response.ok) throw new Error('contact');
  const settings = await response.json();
  if (!/^[1-9][0-9]{9,14}$/.test(settings.whatsapp)) throw new Error('contact');
  whatsappNumber = settings.whatsapp; contactButton.disabled = false;
 } catch {
  contactStatus.textContent = 'Atendimento por WhatsApp indisponível no momento. Tente novamente mais tarde.';
  contactStatus.hidden = false;
 }
}

contactForm.addEventListener('input', () => { whatsappLink.hidden = true; contactStatus.hidden = true; });
contactForm.addEventListener('submit', event => {
 event.preventDefault();
 if (!contactForm.reportValidity()) return;
 try {
  const fields = Object.fromEntries(new FormData(contactForm));
  const url = whatsappUrl(whatsappNumber, fields);
  whatsappLink.href = url; whatsappLink.hidden = false;
  contactStatus.textContent = 'Confira a mensagem e confirme o envio no WhatsApp. Se a conversa não abrir, use o link abaixo.';
  contactStatus.hidden = false;
  window.open(url, '_blank', 'noopener,noreferrer');
 } catch (error) {
  contactStatus.textContent = error.message; contactStatus.hidden = false;
 }
});
loadContact();
