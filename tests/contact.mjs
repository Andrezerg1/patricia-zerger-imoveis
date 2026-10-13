import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const code=readFileSync(new URL('../docs/contact.js',import.meta.url),'utf8');
function page(settings) {
 const listeners={}, button={disabled:true}, status={hidden:true}, link={hidden:true};
 const fields={name:'João & Maria',contact:'cliente@example.invalid',message:'Interesse no PZ-001? Valor & condições.\nUma nova linha.'};
 const form={querySelector:()=>button,addEventListener:(name,handler)=>listeners[name]=handler,reportValidity:()=>true};
 const nodes={'#contact-form':form,'#contact-status':status,'#whatsapp-link':link};
 const opened=[];
 const context=vm.createContext({document:{querySelector:selector=>nodes[selector]},fetch:async()=>({ok:true,json:async()=>settings}),FormData:function(){return Object.entries(fields);},window:{open:(...args)=>opened.push(args)}});
 vm.runInContext(code,context);
 return {context,listeners,button,status,link,opened,form};
}
const configured=page({whatsapp:'5511999999999'});
await new Promise(resolve=>setImmediate(resolve));
assert.equal(configured.button.disabled,false);
configured.listeners.submit({preventDefault(){}});
assert.equal(configured.opened.length,1);
const url=new URL(configured.opened[0][0]);
assert.equal(url.origin,'https://wa.me');
assert.equal(url.pathname,'/5511999999999');
assert.equal([...url.searchParams.keys()].length,1);
assert.match(url.searchParams.get('text'),/João & Maria/);
assert.match(url.searchParams.get('text'),/PZ-001\? Valor & condições\.\nUma nova linha\./);
assert.equal(configured.link.href,url.href);
assert.equal(configured.link.hidden,false);
assert.match(configured.status.textContent,/confirme o envio/);
assert.equal(configured.opened[0][2],'noopener,noreferrer');
configured.listeners.input();assert.equal(configured.link.hidden,true);
configured.form.reportValidity=()=>false;
configured.listeners.submit({preventDefault(){}});assert.equal(configured.opened.length,1);
const unavailable=page({whatsapp:''});
await new Promise(resolve=>setImmediate(resolve));
assert.equal(unavailable.button.disabled,true);
assert.match(unavailable.status.textContent,/indisponível/);
assert.throws(()=>vm.runInContext("whatsappUrl('javascript:alert(1)',{})",unavailable.context));
console.log('PASS: WhatsApp destination, text encoding, validation, fallback and unavailable state. No external messages sent.');
