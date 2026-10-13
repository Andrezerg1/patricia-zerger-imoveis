// Disposable PHP server and catalog: never writes to the user's preview data.
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, cpSync, readFileSync, writeFileSync, rmSync, openSync, closeSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
const source = fileURLToPath(new URL('../',import.meta.url));
const temp = mkdtempSync(join(tmpdir(),'pz-admin-test-'));
const password = process.env.PZ_TEST_PASSWORD;
if (!password) throw Error('Set PZ_TEST_PASSWORD to the configured local admin password.');
for (const name of ['docs','private','router.php']) cpSync(join(source,name),join(temp,name),{recursive:true,filter:p=>!p.startsWith(join(source,'private','data')) && (!p.startsWith(join(source,'docs','uploads')) || p===join(source,'docs','uploads') || p.endsWith('.htaccess'))});
mkdirSync(join(temp,'sessions'));
const port = Number(process.env.PZ_TEST_PORT || 4183);
const base = `http://127.0.0.1:${port}`;
const logFile=join(temp,'server.log'), logFd=openSync(logFile,'w');
const php = spawn(process.env.PHP_BINARY || 'php',['-d','post_max_size=16M','-d',`session.save_path=${join(temp,'sessions')}`,'-d','display_errors=0','-S',`127.0.0.1:${port}`,'-t','docs','router.php'],{cwd:temp,stdio:['ignore',logFd,logFd],windowsHide:true});
function client() {
 let cookie='';
 return async (path, options={}) => {
  const response=await fetch(base+path,{...options,redirect:'manual',headers:{...(cookie?{Cookie:cookie}:{}),...options.headers}});
  const setCookie=response.headers.getSetCookie();
  if(setCookie.length)cookie=setCookie.at(-1).split(';')[0];
  return response;
 };
}
function loginToken(html){return html.match(/name="csrf" value="([a-f0-9]+)"/)[1];}
function panelToken(html){return html.match(/name="csrf-token" content="([a-f0-9]+)"/)[1];}
const form = (username,pass,csrf) => ({method:'POST',body:new URLSearchParams({username,password:pass,csrf})});
const json = (method, data, csrf='') => ({method,headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify(data)});
let checks=0;
function check(value,expected,label){assert.deepEqual(value,expected,label);console.log('PASS',label);checks++;}
try {
 for(let n=0;n<60;n++) {try{await fetch(base+'/');break;}catch{await new Promise(r=>setTimeout(r,100));}}
 const anon=client(), admin=client();
 let res=await anon('/admin/');check(res.status,302,'anonymous admin access redirects');
 res=await anon('/admin/index.php');check(res.status,302,'direct panel URL requires login');
 res=await anon('/api/properties.php?admin=1');check(res.status,401,'draft list requires login');
 res=await anon('/api/properties.php');const originals=await res.json();check(originals.length,0,'new installation starts with no fictitious listings');
 res=await anon('/api/properties.php',json('POST',originals[0]));check(res.status,401,'anonymous writes denied');
 res=await anon('/api/properties.php',json('DELETE',{id:'PZ-001'}));check(res.status,401,'anonymous deletes denied');
 for(const p of ['/private/config.php','/.git/config','/admin/admin.php/missing','/.user.ini','/uploads/.htaccess'])check((await anon(p)).status,404,'private path hidden: '+p);
 let html=await(await admin('/admin/login.php')).text();
 const prelogin=loginToken(html);
 res=await admin('/admin/login.php',form('admin',password,''));check((await res.text()).includes('Sua sessão expirou'),true,'login CSRF required');
 res=await admin('/admin/login.php',form('admin','incorrect',prelogin));html=await res.text();check(html.includes('Usuário ou senha incorretos'),true,'wrong password rejected');
 res=await admin('/admin/login.php',form('admin',password,loginToken(html)));check(res.status,303,'configured credentials accepted');
 check(res.headers.get('set-cookie').includes('HttpOnly'),true,'session cookie is HttpOnly');
 check(res.headers.get('set-cookie').includes('SameSite=Strict'),true,'session cookie is SameSite Strict');
 html=await(await admin('/admin/index.php')).text();const csrf=panelToken(html);
 check(html.includes('property-form'),true,'form available after login');
 check(csrf!==prelogin,true,'CSRF token rotates after login');
 const defaults=JSON.parse(readFileSync(join(source,'private/settings-defaults.json'),'utf8'));
 res=await anon('/api/settings.php');check(await res.json(),{whatsapp:defaults.whatsapp},'public settings expose only the business WhatsApp');
 check((await anon('/api/settings.php?admin=1')).status,401,'settings administration requires login');
 check((await anon('/api/settings.php',json('POST',{whatsapp:'5511999999999'}))).status,401,'anonymous contact changes denied');
 check((await admin('/api/settings.php',json('POST',{whatsapp:'5511999999999'}))).status,403,'contact changes require CSRF');
 for(const number of ['javascript:alert(1)','55123','https://evil.invalid','0'.repeat(12)]) {
  check((await admin('/api/settings.php',json('POST',{whatsapp:number},csrf))).status,422,'unsafe or invalid WhatsApp rejected: '+number);
 }
 check((await admin('/api/settings.php',json('POST',{whatsapp:'+55 (11) 99999-9999'},csrf))).status,200,'administrator saves formatted WhatsApp');
 check(await(await client()('/api/settings.php')).json(),{whatsapp:'5511999999999'},'saved contact persists for independent visitors');
 check((await admin('/api/settings.php',json('POST',{whatsapp:defaults.whatsapp},csrf))).status,200,'restore official contact after isolated test');
 res=await admin('/api/properties.php?admin=1',json('POST',originals[0]));check(res.status,403,'save CSRF required');
 const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z4e0AAAAASUVORK5CYII=';
 const item={id:'PZ-TEST01',title:'Teste isolado',type:'Casa',neighborhood:'Bairro de teste',street:'Rua de teste',price:500000,area:100,beds:2,baths:1,parking:1,description:'Cadastro temporário do teste automatizado.',featured:false,status:'draft',photos:[png]};
 res=await admin('/api/properties.php?admin=1',json('POST',item,csrf));check(res.status,200,'create draft with uploaded photo');
 let rows=await(await anon('/api/properties.php')).json();check(rows.some(p=>p.id===item.id),false,'draft hidden from visitors');
 rows=await(await admin('/api/properties.php?admin=1')).json();let stored=rows.find(p=>p.id===item.id);
 check(Boolean(stored),true,'draft visible to administrator');
 check(stored.photos[0].startsWith('uploads/'),true,'photo stored on server');
 check((await anon('/'+stored.photos[0])).status,200,'uploaded photo can be displayed');
 res=await admin('/api/properties.php?admin=1',json('POST',{...stored,status:'published',price:123456},csrf));check(res.status,200,'edit and publish');
 const visitor=client(); rows=await(await visitor('/api/properties.php')).json();
 check(rows.find(p=>p.id===item.id)?.price,123456,'independent visitor sees saved changes');
 res=await admin('/api/properties.php',json('POST',{...stored,photos:['javascript:alert(1)']},csrf));check(res.status,422,'unsafe photo URL rejected');
 res=await admin('/api/properties.php',json('POST',{...stored,photos:['data:image/png;base64,PHNjcmlwdD4=']},csrf));check(res.status,422,'non-image upload rejected');
 res=await admin('/api/properties.php',json('POST',{...stored,price:-1},csrf));check(res.status,422,'invalid price rejected');
 res=await admin('/api/properties.php',json('POST',{...stored,photos:Array(9).fill(png)},csrf));check(res.status,422,'photo count limit enforced');
 res=await admin('/api/properties.php',json('POST',{...stored,beds:1.5},csrf));check(res.status,422,'fractional room count rejected');
 res=await admin('/api/properties.php',json('DELETE',{id:item.id},csrf));check(res.status,200,'delete property');
 rows=await(await anon('/api/properties.php')).json();check(rows.length,0,'catalog restored after deleting test item');
 check((await anon('/'+stored.photos[0])).status,404,'unused upload removed');
 res=await admin('/admin/logout.php',{method:'POST',body:new URLSearchParams({csrf})});check(res.status,303,'logout succeeds');
 check((await admin('/admin/index.php')).status,302,'panel denied after logout');
 check((await admin('/api/settings.php',json('POST',{whatsapp:'5511999999999'},csrf))).status,401,'logged out session cannot change contact');
 check((await admin('/api/properties.php',json('DELETE',{id:'PZ-001'},csrf))).status,401,'old token cannot write after logout');
 html=await(await admin('/admin/login.php')).text();await admin('/admin/login.php',form('admin',password,loginToken(html)));
 const sessionFiles=(await import('node:fs')).readdirSync(join(temp,'sessions'));
 for(const name of sessionFiles){const file=join(temp,'sessions',name);const content=readFileSync(file,'utf8');writeFileSync(file,content.replace(/last_active\|i:\d+;/,'last_active|i:1;'));}
 check((await admin('/admin/index.php')).status,302,'idle session expires server-side');
 for(let n=0;n<5;n++){const bot=client();html=await(await bot('/admin/login.php')).text();await bot('/admin/login.php',form('admin','bad',loginToken(html)));}
 const bot=client();html=await(await bot('/admin/login.php')).text();res=await bot('/admin/login.php',form('admin',password,loginToken(html)));
 check((await res.text()).includes('Muitas tentativas'),true,'rate limit persists across new browser sessions');
 check(readFileSync(join(source,'docs/index.html'),'utf8').includes('property-form'),false,'public HTML contains no admin form');
 check(/Fatal error|Warning:|Uncaught/.test(readFileSync(logFile,'utf8')),false,'PHP emitted no runtime errors');
 console.log(`SUCCESS: ${checks} integration checks.`);
} finally {
 const exited=once(php,'exit');php.kill();await exited;
 closeSync(logFd);
 const safe=resolve(temp);if(safe.startsWith(resolve(tmpdir())+'\\pz-admin-test-')||safe.startsWith(resolve(tmpdir())+'/pz-admin-test-'))rmSync(safe,{recursive:true,force:true});
}
