import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const code=readFileSync(new URL('../docs/contact.js',import.meta.url),'utf8');
function link(){return {dataset:{},attrs:{'aria-disabled':'true'},removeAttribute(k){delete this.attrs[k];if(k==='href')delete this.href;},setAttribute(k,v){this.attrs[k]=v;}};}
function page(settings){
 const home=link(),detail=link(),status={hidden:true};
 const context=vm.createContext({document:{querySelector:selector=>selector==='#contact-status'?status:null,querySelectorAll:()=>[home,detail]},fetch:async()=>({ok:true,json:async()=>settings})});
 vm.runInContext(code,context);
 context.detail=detail;
 vm.runInContext("configureWhatsAppLink(detail,'Interesse no PZ-001 — Casa & jardim?')",context);
 return {context,home,detail,status};
}
const ok=page({whatsapp:'554398559499'});
await new Promise(setImmediate);
assert.equal(new URL(ok.home.href).searchParams.get('text'),'Olá, Patricia! Gostaria de conversar com você.');
assert.equal(new URL(ok.detail.href).searchParams.get('text'),'Interesse no PZ-001 — Casa & jardim?');
assert.equal(new URL(ok.detail.href).pathname,'/554398559499');
assert.equal(ok.home.attrs['aria-disabled'],undefined);
vm.runInContext("configureWhatsAppLink(detail,'Outro imóvel PZ-002')",ok.context);
assert.equal(new URL(ok.detail.href).searchParams.get('text'),'Outro imóvel PZ-002');
assert.equal(new URL(ok.home.href).searchParams.get('text'),'Olá, Patricia! Gostaria de conversar com você.');
const bad=page({whatsapp:'javascript:alert(1)'});
await new Promise(setImmediate);
assert.equal(bad.home.href,undefined);
assert.equal(bad.detail.href,undefined);
assert.equal(bad.status.hidden,false);
console.log('PASS: general contact, property-specific message, async loading and unavailable contact.');
