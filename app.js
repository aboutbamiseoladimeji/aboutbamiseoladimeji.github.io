// Public site content. Replace this file's linked data by editing data/site.json through the admin workflow.
async function loadSiteContent(){
  try{
    const response=await fetch('data/site.json',{cache:'no-store'});
    if(!response.ok) throw new Error('No site content file yet');
    renderSite(await response.json());
  }catch(error){
    console.warn(error);
    renderSite(window.SITE_CONTENT_FALLBACK || {});
  }
}
function setText(id,value){const el=document.getElementById(id);if(el&&value!==undefined&&value!==null)el.textContent=value;}
function safeUrl(url){try{const u=new URL(url,location.href);return ['http:','https:','mailto:'].includes(u.protocol)?u.href:'#';}catch{return '#';}}
function renderSite(d){
  const p=d.profile||{};
  document.title=`${p.name||'Your Name'} — ${p.title||'Your Professional Title'}`;
  ['nav-name','footer-name'].forEach(id=>setText(id,p.name||'Your Name'));
  setText('hero-name',p.name||'Your Name');setText('hero-title',p.title||'Your Professional Title');
  setText('hero-bio',p.intro||'A short introduction about you goes here.');setText('about-text',p.about||'Tell visitors more about yourself here.');
  setText('contact-copy',p.contactMessage||'For opportunities, collaborations, or a friendly hello, get in touch.');
  setText('portrait-caption',p.photoCaption||'A LITTLE ABOUT ME');setText('footer-note',p.footerNote||'Made with care.');
  const photo=document.getElementById('profile-photo');if(photo&&p.photo)photo.src=safeUrl(p.photo);
  const email=p.email||'hello@example.com';const emailEl=document.getElementById('contact-email');emailEl.href=`mailto:${email}`;emailEl.textContent=`${email} ↗`;
  const socials=(d.socials||[]).filter(s=>s.enabled!==false);
  const makeLinks=(target)=>{const el=document.getElementById(target);el.innerHTML='';socials.forEach(s=>{const a=document.createElement('a');a.href=safeUrl(s.url||'#');a.textContent=s.label||s.platform||'Social';a.target=s.url&&s.url.startsWith('mailto:')?'_self':'_blank';if(a.target==='_blank')a.rel='noopener noreferrer';el.appendChild(a);});};
  makeLinks('hero-socials');makeLinks('contact-socials');
  const facts=document.getElementById('facts-grid');facts.innerHTML='';(d.facts||[]).forEach(f=>{facts.insertAdjacentHTML('beforeend',`<div class="fact"><strong>${esc(f.label)}</strong><span>${esc(f.value)}</span></div>`);});
  renderTimeline('experience-list',d.experience||[]);renderTimeline('education-list',d.education||[]);
  const skills=document.getElementById('skills-list');skills.innerHTML='';(d.skills||[]).forEach(s=>{const span=document.createElement('span');span.className='chip';span.textContent=typeof s==='string'?s:s.name;skills.appendChild(span);});
  const certs=document.getElementById('certifications-list');certs.innerHTML='';(d.certifications||[]).forEach(c=>{const div=document.createElement('div');div.className='certification';div.textContent=typeof c==='string'?c:[c.name,c.issuer,c.year].filter(Boolean).join(' · ');certs.appendChild(div);});
  const docs=document.getElementById('documents-list');docs.innerHTML='';(d.documents||[]).forEach(doc=>{const row=document.createElement('div');row.className='document-row';const info=document.createElement('div');const title=document.createElement('strong');title.textContent=doc.title||'Document';const desc=document.createElement('small');desc.textContent=doc.description||'';info.append(title,desc);const link=document.createElement('a');link.className='download-link';link.href=safeUrl(doc.url||'#');link.textContent='Download ↓';link.download='';link.target='_blank';link.rel='noopener noreferrer';row.append(info,link);docs.appendChild(row);});
  const resume=(d.documents||[]).find(x=>(x.type||'').toLowerCase()==='resume'||(x.title||'').toLowerCase().includes('résumé')||(x.title||'').toLowerCase().includes('resume'));
  if(resume)document.getElementById('hero-resume').href=safeUrl(resume.url);
}
function renderTimeline(id,items){const root=document.getElementById(id);root.innerHTML='';if(!items.length){root.innerHTML='<p class="empty-note">Details coming soon.</p>';return;}items.forEach(x=>{const el=document.createElement('article');el.className='timeline-item';const h=document.createElement('h3');h.textContent=x.role||x.degree||x.title||'Entry';const meta=document.createElement('div');meta.className='timeline-meta';meta.textContent=[x.organization||x.institution,x.period||x.year,x.location].filter(Boolean).join(' · ');const p=document.createElement('p');p.textContent=x.description||'';el.append(h,meta,p);root.appendChild(el);});}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
document.getElementById('menu-toggle').addEventListener('click',()=>document.getElementById('nav-links').classList.toggle('open'));
document.querySelectorAll('#nav-links a').forEach(a=>a.addEventListener('click',()=>document.getElementById('nav-links').classList.remove('open')));
loadSiteContent();
