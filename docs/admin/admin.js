'use strict';
let properties = [], editingId = null, deletingId = null;
function renderAdmin(){$('#admin-count').textContent=`Seus imóveis (${properties.length})`;$('#admin-list').innerHTML=properties.length?properties.map(p=>`<div class="admin-row"><img src="${esc(p.photos[0])}" alt=""><div class="admin-row-info"><strong>${esc(p.title)}</strong><small>${esc(p.id)} · ${money(p.price)} · ${p.status==='published'?'Publicado':'Rascunho'}</small></div><div class="admin-row-actions"><button data-edit="${esc(p.id)}" aria-label="Editar ${esc(p.id)}">Editar</button><button data-delete="${esc(p.id)}" aria-label="Excluir ${esc(p.id)}">Excluir</button></div></div>`).join(''):'<p>Seu catálogo está vazio. Cadastre o primeiro imóvel.</p>';}
$('#admin-list').onclick=event=>{const edit=event.target.closest('[data-edit]'),remove=event.target.closest('[data-delete]');if(edit)editProperty(edit.dataset.edit);if(remove){deletingId=remove.dataset.delete;$('#confirm-dialog').showModal();}};
$('#new-property').onclick=()=>editProperty(null);
$('#cancel-edit').onclick=()=>{$('#property-form').hidden=true;editingId=null;};
function editProperty(id){editingId=id;const form=$('#property-form');form.reset();$('#photo-preview').innerHTML='';const p=properties.find(item=>item.id===id);$('#editor-title').textContent=p?'Editar imóvel':'Novo imóvel';if(p){for(const key of ['title','type','neighborhood','street','price','area','beds','baths','parking','status','description'])form.elements[key].value=p[key];form.elements.featured.checked=p.featured;$('#photo-preview').innerHTML=p.photos.map(src=>`<img src="${esc(src)}" alt="Foto atual do imóvel">`).join('');}form.hidden=false;form.scrollIntoView({behavior:'smooth',block:'start'});form.elements.title.focus({preventScroll:true});}
function imageToData(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>{const image=new Image();image.onload=()=>{const scale=Math.min(1,1600/Math.max(image.width,image.height));const canvas=document.createElement('canvas');canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.84));};image.onerror=()=>reject(new Error('Uma das fotos não pôde ser lida.'));image.src=reader.result;};reader.onerror=()=>reject(new Error('Falha ao carregar a foto.'));reader.readAsDataURL(file);});}
$('#property-form').addEventListener('submit',async event=>{event.preventDefault();const form=event.currentTarget,button=$('[type="submit"]',form);button.disabled=true;button.textContent='Salvando…';try{const files=[...form.elements.photos.files];if(files.length>8)throw new Error('Selecione no máximo 8 fotos.');if(files.some(file=>file.size>5*1024*1024||!['image/jpeg','image/png','image/webp'].includes(file.type)))throw new Error('Use fotos JPG, PNG ou WebP de até 5 MB cada.');const existing=properties.find(p=>p.id===editingId);if(!existing&&!files.length)throw new Error('Adicione pelo menos uma foto ao novo imóvel.');const entry={id:existing?.id||`PZ-${Date.now().toString(36).toUpperCase()}`,photos:files.length?await Promise.all(files.map(imageToData)):existing.photos,featured:form.elements.featured.checked};for(const name of ['title','type','neighborhood','street','description','status'])entry[name]=form.elements[name].value.trim();if(['title','neighborhood','street','description'].some(name=>!entry[name]))throw new Error('Preencha todos os campos obrigatórios.');for(const name of ['price','area','beds','baths','parking'])entry[name]=Number(form.elements[name].value);await api('POST',entry);await loadProperties();form.hidden=true;editingId=null;notify('Imóvel salvo. O catálogo já está atualizado.');}catch(error){notify(error.message||'Não foi possível salvar o imóvel.');}finally{button.disabled=false;button.textContent='Salvar imóvel';}});
$('#confirm-delete').onclick=async()=>{const button=$('#confirm-delete');button.disabled=true;try{await api('DELETE',{id:deletingId});await loadProperties();if(editingId===deletingId)$('#property-form').hidden=true;renderAdmin();$('#confirm-dialog').close();notify('Imóvel excluído do catálogo.');}catch(error){notify(error.message || 'Não foi possível excluir o imóvel.');}finally{button.disabled=false;}};

const csrf = document.querySelector('meta[name="csrf-token"]').content;
async function api(method = 'GET', data) {
 const response = await fetch('api/properties.php?admin=1', {
  method, cache:'no-store', headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},
  ...(data ? {body:JSON.stringify(data)} : {})
 });
 if (response.status === 401) { location.href = 'admin/login.php?expired=1'; throw new Error('Sua sessão expirou. Entre novamente.'); }
 const result = await response.json();
 if (!response.ok) throw new Error(result.error || 'Não foi possível concluir a operação.');
 return result;
}
async function loadProperties() {
 properties = await api(); renderAdmin();
 $('#published-count').textContent = properties.filter(p => p.status === 'published').length;
 $('#draft-count').textContent = properties.filter(p => p.status === 'draft').length;
 $('#total-count').textContent = properties.length;
}
loadProperties().then(() => $('#new-property').disabled = false).catch(error => {
 $('#admin-count').textContent = 'Não foi possível carregar os imóveis'; notify(error.message);
});
window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
