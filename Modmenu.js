/* VUS Mod Menu — loads AFTER the main script (see index.html).
   Client-side only: it changes how YOU see and write messages. Every send still goes
   through the app's own checks (rank cooldowns, timeouts, bans, image access).
   Hotkeys: Alt+M = open/close menu · Alt+H = panic-hide menu + launcher. */
(()=>{
'use strict';
const LS='vusMod1';
const THEMES={Default:['#0f172a','#1e293b','#334155','#14532d','#166534','#f1f5f9','#22c55e'],Midnight:['#000','#0b0b14','#1c1c2e','#1a1a40','#33336b','#e5e7eb','#818cf8'],Dracula:['#282a36','#44475a','#6272a4','#3b3f5c','#bd93f9','#f8f8f2','#bd93f9'],Nord:['#2e3440','#3b4252','#4c566a','#434c5e','#88c0d0','#eceff4','#88c0d0'],Matrix:['#000','#001a00','#003300','#003b00','#00aa00','#00ff41','#00ff41'],Sunset:['#2b1020','#3d1a2e','#6b2d4a','#7a2e1d','#c2410c','#fde8d8','#fb923c'],Ocean:['#06202b','#0a3446','#116466','#0e4d64','#1d8aa6','#e0f7fa','#22d3ee'],Rose:['#1f1017','#3a1c2a','#6b2c4a','#5b1a3a','#be185d','#ffe4ef','#f472b6'],Solar:['#002b36','#073642','#586e75','#0b4a4a','#2aa198','#eee8d5','#b58900'],Light:['#f1f5f9','#ffffff','#cbd5e1','#bbf7d0','#86efac','#0f172a','#16a34a'],Contrast:['#000','#000','#fff','#000','#ff0','#fff','#ff0']};
const mk=(s,v)=>Object.fromEntries(s.split(' ').map(k=>[k,v]));
const D={...mk('hs hb ht cp gr bi hi zen ag cs cap lock dnd mp dn fl vib tts open',false),...mk('lk lb an snap launch ut fv emo ttsm',true),
theme:'Default',font:'system-ui,Arial,sans-serif',fs:20,ms:16,mw:82,gap:12,zoom:1,bs:'round',br:100,warm:0,dim:.4,bg:'',ac:'',ccss:'',kw:'',cw:'',pre:'',suf:'',tf:'none',snd:'off',st:'blip',vol:70,rate:1,op:100,msc:1,
muted:[],fr:[],hl:{},nick:{},snips:[],hist:[],pins:[],note:'',pos:null,lpos:null};
const BOOL=Object.keys(D).filter(k=>typeof D[k]==='boolean');
let S={...D};try{Object.assign(S,JSON.parse(localStorage.getItem(LS)||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){}};
const ST={seen:0,sent:0,t0:Date.now(),un:0,hold:false,held:0,ready:false};
const LOG=[];
const h=(t,a,...c)=>{const e=document.createElement(t);Object.assign(e,a||{});c.flat().forEach(x=>x!=null&&e.append(x));return e};
const lst=s=>(s||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
const reEsc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const toast=m=>{const t=h('div',{className:'vt',textContent:m});document.body.append(t);setTimeout(()=>t.remove(),3000)};
const copy=t=>navigator.clipboard&&navigator.clipboard.writeText(t).then(()=>toast('Copied'));
const ins=s=>{const i=$msgInput,a=i.selectionStart==null?i.value.length:i.selectionStart,b=i.selectionEnd==null?a:i.selectionEnd;i.setRangeText(s,a,b,'end');if(i.value.length>500)i.value=i.value.slice(0,500);i.dispatchEvent(new Event('input',{bubbles:true}));i.focus()};
const dl=(n,txt,type)=>{const a=h('a',{href:URL.createObjectURL(new Blob([txt],{type})),download:n});document.body.append(a);a.click();a.remove()};
const tog=(k,v)=>{const i=S[k].indexOf(v);i<0?S[k].push(v):S[k].splice(i,1);save();refresh()};

/* ───────── text styles / transforms (applied when YOU send) ───────── */
const FN={bold:[0x1D400,0x1D41A],italic:[0x1D434,0x1D44E],script:[0x1D4D0,0x1D4EA],fraktur:[0x1D56C,0x1D586],sans:[0x1D5A0,0x1D5BA],mono:[0x1D670,0x1D68A],wide:[0xFF21,0xFF41],circle:[0x24B6,0x24D0]};
const fancy=(s,[u,l],k)=>[...s].map(c=>{const n=c.charCodeAt(0);if(k==='italic'&&c==='h')return'ℎ';return n>=65&&n<=90?String.fromCodePoint(u+n-65):n>=97&&n<=122?String.fromCodePoint(l+n-97):c}).join('');
const TF={none:s=>s,upper:s=>s.toUpperCase(),lower:s=>s.toLowerCase(),mock:s=>[...s].map((c,i)=>i%2?c.toUpperCase():c.toLowerCase()).join(''),
uwu:s=>s.replace(/[lr]/g,'w').replace(/[LR]/g,'W').replace(/n([aeiou])/g,'ny$1').replace(/!+/g,' >w<'),clap:s=>s.split(/\s+/).join(' 👏 '),
leet:s=>s.replace(/[aeiolst]/gi,c=>({a:4,e:3,i:1,o:0,l:1,s:5,t:7})[c.toLowerCase()]),rev:s=>[...s].reverse().join(''),spaced:s=>[...s].join(' ')};
Object.keys(FN).forEach(k=>TF[k]=s=>fancy(s,FN[k],k));
const EM={smile:'😄',heart:'❤️',fire:'🔥',thumbsup:'👍',laugh:'😂',cry:'😭',think:'🤔',cool:'😎',party:'🎉',skull:'💀',eyes:'👀',100:'💯',sparkles:'✨',wave:'👋',ok:'👌',clap:'👏',rocket:'🚀',sob:'🥲',shrug:'¯\\_(ツ)_/¯',tableflip:'(╯°□°)╯︵ ┻━┻',unflip:'┬─┬ ノ( ゜-゜ノ)',lenny:'( ͡° ͜ʖ ͡°)'};
const cut=t=>{let o='';for(const c of t){if((o+c).length>500)break;o+=c}return o};
const tx=t=>{if(S.emo)t=t.replace(/:(\w+):/g,(m,k)=>EM[k]||m);if(S.cap)t=t.replace(/(^\s*|[.!?]\s+)([a-z])/g,(m,a,b)=>a+b.toUpperCase());t=S.pre+t+S.suf;return cut((TF[S.tf]||TF.none)(t))};
const EMO='😀😁😂🤣😊😍😘😎🤔😴😭😡🥳🤯🥺😏🙄😬🤗😇👍👎👏🙌🙏💪👀🔥✨💯🎉❤️💔💀👻🤖🎮🎵🍕🍔☕🍺🚀⭐🌈🌙☀️⚡🐱🐶🦊🐸'.match(/\p{Extended_Pictographic}\uFE0F?(\u200D\p{Extended_Pictographic}\uFE0F?)*/gu);

/* ───────── sounds / alerts ───────── */
let AC;const beep=(ty)=>{ty=ty||S.st;try{AC=AC||new AudioContext();const v=S.vol/100*.3,t=AC.currentTime;({blip:[[880,0,.1]],chime:[[660,0,.15],[990,.12,.25]],pop:[[300,0,.05],[600,.04,.08]],bell:[[1200,0,.6]]})[ty].forEach(([f,d,l])=>{const o=AC.createOscillator(),g=AC.createGain();o.frequency.value=f;o.type=ty==='pop'?'square':ty==='bell'?'triangle':'sine';g.gain.setValueAtTime(v,t+d);g.gain.exponentialRampToValueAtTime(.0001,t+d+l);o.connect(g).connect(AC.destination);o.start(t+d);o.stop(t+d+l+.05)})}catch(e){}};
const BASE=document.title;
const badge=()=>{if(S.ut)document.title=ST.un?'('+ST.un+') '+BASE:BASE;if(S.fv){const c=h('canvas',{width:32,height:32}),x=c.getContext('2d');x.fillStyle=ST.un?'#ef4444':'#22c55e';x.beginPath();x.arc(16,16,15,0,7);x.fill();if(ST.un){x.fillStyle='#fff';x.font='bold 20px Arial';x.textAlign='center';x.fillText(ST.un>9?'9+':ST.un,16,23)}let l=document.querySelector('link[rel=icon]');if(!l){l=h('link',{rel:'icon'});document.head.append(l)}l.href=c.toDataURL()}};
document.addEventListener('visibilitychange',()=>{if(!document.hidden){ST.un=0;badge()}});
const fire=(why,n,raw)=>{if(S.dnd)return;if(S.snd==='all'||(S.snd==='mention'&&why))beep();
if(S.tts&&(!S.ttsm||why)&&window.speechSynthesis){const u=new SpeechSynthesisUtterance(n+' says '+raw);u.rate=+S.rate;speechSynthesis.speak(u)}
if(document.hidden){ST.un++;badge();if(S.dn&&why&&window.Notification&&Notification.permission==='granted')try{new Notification(n,{body:raw})}catch(e){}}
if(why&&S.fl){document.body.classList.add('vm-flash');setTimeout(()=>document.body.classList.remove('vm-flash'),400)}
if(why&&S.vib&&navigator.vibrate)navigator.vibrate(200)};

/* ───────── per-message processing ───────── */
const style1=el=>{const n=el.dataset.vmName||'',k=n.toLowerCase();el.classList.toggle('vm-hide',S.muted.includes(k)||el.dataset.vmH==='1');
el.style.borderLeft=S.hl[k]?'3px solid '+S.hl[k]:'';el.style.paddingLeft=S.hl[k]?'8px':'';
const m=el.querySelector('.msg-meta');if(m&&el.dataset.vmMeta)m.textContent=S.nick[k]&&n!==myName?el.dataset.vmMeta.replace(n,S.nick[k]+'*'):el.dataset.vmMeta};
const refresh=()=>document.querySelectorAll('.msg:not(.system)').forEach(style1);
const rich=b=>{const cw=lst(S.cw),kw=lst(S.kw);const w=[];const tw=document.createTreeWalker(b,NodeFilter.SHOW_TEXT);while(tw.nextNode())w.push(tw.currentNode);
w.forEach(t=>{const o=esc(t.nodeValue);const s=o.split(/(https?:\/\/[^\s<]+)/g).map((p,i)=>{if(i%2)return S.lk?`<a href="${p}" target="_blank" rel="noopener noreferrer" style="color:var(--vm-ac);text-decoration:underline">${p}</a>`:p;
cw.forEach(x=>{p=p.replace(new RegExp(reEsc(esc(x)),'gi'),m=>'•'.repeat(m.length))});kw.forEach(x=>{p=p.replace(new RegExp(reEsc(esc(x)),'gi'),m=>`<mark class="vm-mk">${m}</mark>`)});return p}).join('');
if(s!==o){const sp=h('span');sp.innerHTML=s;t.replaceWith(sp)}})};
const actions=el=>{const b=(t,ti,f)=>h('button',{textContent:t,title:ti,onclick:e=>{e.stopPropagation();f()}});
return h('div',{className:'vm-act'},b('📋','Copy',()=>copy(el.dataset.vmRaw)),b('↩','Quote',()=>ins('> '+el.dataset.vmName+': '+el.dataset.vmRaw.slice(0,120)+'\n')),
b('🔇','Mute this user (local)',()=>{if(el.dataset.vmName!==myName)tog('muted',el.dataset.vmName.toLowerCase())}),b('📌','Pin (local)',()=>{S.pins.push({n:el.dataset.vmName,t:el.dataset.vmRaw});save();toast('Pinned')}),b('👁','Hide this message',()=>{el.dataset.vmH='1';style1(el)}))};
const proc=el=>{if(el.dataset.vm||el.classList.contains('system'))return;el.dataset.vm=1;if(!ST.rt)ST.rt=setTimeout(()=>ST.ready=true,5000);
const br=el.querySelector('.role-bubble-row'),n=br?br.dataset.senderName:'',b=el.querySelector('.msg-bubble'),m=el.querySelector('.msg-meta'),img=b&&b.querySelector('img');
el.dataset.vmName=n;el.dataset.vmMeta=m?m.textContent:'';const raw=img?'[image]':b.textContent;el.dataset.vmRaw=raw;LOG.push({n,t:raw,ts:Date.now()});ST.seen++;
const chip=el.querySelector('.mention-chip-inline'),ment=!!myName&&((chip&&chip.textContent==='@'+myName)||new RegExp('@'+reEsc(myName)+'\\b','i').test(raw)),hit=lst(S.kw).some(k=>raw.toLowerCase().includes(k));
if(!img)rich(b);const pv=el.previousElementSibling;if(pv&&pv.dataset.vmName===n&&!pv.classList.contains('system'))el.classList.add('vm-grp');
el.append(actions(el));if(ST.hold){el.classList.add('vm-held');ST.held++}style1(el);if(ment||hit)el.classList.add('vm-me');
if(ST.ready&&n!==myName&&!el.classList.contains('vm-hide'))fire(ment||hit,n,raw)};

/* ───────── appearance ───────── */
const dyn=h('style'),stat=h('style');document.head.append(stat,dyn);
stat.textContent=`:root{--vm-ac:#22c55e}
body.vm-hs .msg.system,body.vm-hb .role-bubble-row,body.vm-ht .msg-meta,body.vm-zen .chat-header,body.vm-zen #toolbar,body.vm-zen #typingBar,body.vm-hi .msg-bubble img{display:none!important}
body.vm-cp #messages{gap:3px!important}body.vm-cp .msg-bubble{padding:4px 10px!important}
body.vm-gr .vm-grp .msg-meta,body.vm-gr .vm-grp .role-bubble-row{display:none!important}body.vm-gr .vm-grp{margin-top:-9px}
body.vm-bi .msg-bubble img{filter:blur(14px);transition:.2s}body.vm-bi .msg-bubble img:hover{filter:none}
body.vm-an .msg{animation:vmpop .25s}@keyframes vmpop{from{opacity:0;transform:translateY(8px) scale(.97)}}
body.vm-ag #messages{background:linear-gradient(120deg,#1e3a8a33,#7c3aed33,#06b6d433,#22c55e33)!important;background-size:400% 400%;animation:vmg 14s ease infinite}@keyframes vmg{50%{background-position:100% 50%}}
body.vm-flash{box-shadow:inset 0 0 0 6px var(--vm-ac)}
.vm-hide,.vm-nf,.vm-held{display:none!important}.msg{position:relative}.vm-me .msg-bubble{box-shadow:0 0 0 2px var(--vm-ac)}.vm-mk{background:#facc15;color:#000;border-radius:3px;padding:0 2px}
.vm-act{position:absolute;top:-12px;right:4px;display:none;gap:1px;background:#0f172a;border:1px solid #334155;border-radius:8px;padding:1px 3px;z-index:5}.msg.mine .vm-act{right:auto;left:4px}.msg:hover .vm-act{display:flex}.vm-act button{background:none;border:0;cursor:pointer;font-size:14px;padding:2px}
.vlb{position:fixed;inset:0;background:#000d;z-index:100000;display:flex;align-items:center;justify-content:center;cursor:zoom-out}.vlb img{max-width:92vw;max-height:92vh;border-radius:8px}
.vt{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#0f172a;color:#f1f5f9;border:1.5px solid var(--vm-ac);padding:8px 14px;border-radius:10px;z-index:100001;font:14px Arial}
.vm-panic #vm,.vm-panic #vml{display:none!important}
#vml{position:fixed;z-index:99998;width:46px;height:46px;border-radius:50%;border:2px solid var(--vm-ac);background:#0b1220;color:#fff;font-size:22px;cursor:grab;box-shadow:0 4px 16px #0008}
#vm{position:fixed;z-index:99999;width:390px;height:560px;min-width:290px;min-height:240px;max-width:98vw;max-height:96vh;background:#0b1220;color:#e2e8f0;border:1.5px solid #334155;border-radius:14px;box-shadow:0 14px 44px #000a;display:none;flex-direction:column;resize:both;overflow:hidden;font:13px Arial;transform-origin:top left}
#vm.on{display:flex}#vm.min{height:auto!important;min-height:0;resize:none}#vm.min .vtabs,#vm.min .vbody{display:none}
#vm .vhd{display:flex;align-items:center;justify-content:space-between;padding:9px 12px;background:#111b30;cursor:move;font-weight:700;border-bottom:1.5px solid #334155;user-select:none}
#vm .vhd button{background:none;border:0;color:#94a3b8;font-size:16px;cursor:pointer}#vm .vtabs{display:flex;overflow-x:auto;background:#0f172a;border-bottom:1px solid #1e293b;flex-shrink:0}
#vm .vtabs button{flex:none;background:none;border:0;border-bottom:2px solid transparent;color:#94a3b8;padding:8px 10px;cursor:pointer;font-size:12.5px}#vm .vtabs button.on{color:var(--vm-ac);border-color:var(--vm-ac)}
#vm .vbody{flex:1;overflow-y:auto;padding:6px 12px 14px}#vm .vh{margin:12px 0 4px;color:var(--vm-ac);font-weight:700;text-transform:uppercase;font-size:11px;letter-spacing:.08em}#vm .vn{color:#64748b;font-size:12px;padding:3px 0}
#vm .vr{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 0;border-bottom:1px solid #1e293b}#vm .vr.col{display:block}
#vm input[type=text],#vm input[type=number],#vm textarea,#vm select,#vm .vi{background:#1e293b;border:1px solid #334155;color:#f1f5f9;border-radius:7px;padding:6px 8px;font:inherit;max-width:100%}#vm .col input,#vm .col textarea,#vm .vi{width:100%;margin:3px 0}
#vm input[type=range]{width:150px;accent-color:var(--vm-ac)}#vm input[type=checkbox]{accent-color:var(--vm-ac);width:16px;height:16px}
#vm button.vb{background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:7px;padding:6px 9px;margin:3px 3px 0 0;cursor:pointer;font:inherit}#vm button.vb:hover{border-color:var(--vm-ac)}
#vm .vp{background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:8px;white-space:pre-wrap;font:12px ui-monospace,monospace;margin:6px 0}`;
if(typeof PING_YOU_WEBHOOK_URL!=='undefined'&&!PING_YOU_WEBHOOK_URL)stat.textContent+='#pingYouBtn{display:none!important}';
let menu,launcher;
const apply=()=>{const t=THEMES[S.theme]||THEMES.Default,ac=S.ac||t[6],r=document.documentElement.style;r.setProperty('--vm-ac',ac);
BOOL.forEach(k=>document.body.classList.toggle('vm-'+k,!!S[k]));
const A=`border-color:${ac}!important`,bs={round:'',square:'border-radius:3px!important',pill:'border-radius:26px!important',glass:'backdrop-filter:blur(8px)',outline:A,neon:`box-shadow:0 0 12px ${ac}`}[S.bs]||'';
const bgb=S.bs==='glass'?'background:rgba(255,255,255,.1)!important':S.bs==='outline'?'background:transparent!important':'';
dyn.textContent=`body{background:${t[0]}!important;color:${t[5]}!important;font-family:${S.font}!important}html{zoom:${S.zoom}}
.chat-header,#toolbar{border-color:${t[2]}!important}.msg-bubble{border-color:${t[2]}!important;font-size:${S.fs}px!important;${bs}}
.msg-bubble:not([style*=background]){background:${t[1]}!important;color:${t[5]};${bgb}}.msg.mine .msg-bubble:not([style*=background]){background:${t[3]}!important;${bgb}}.msg.mine .msg-bubble{border-color:${t[4]}!important}
.msg-meta{font-size:${S.ms}px!important}.msg{max-width:${S.mw}%!important}
#messages{gap:${S.gap}px!important;filter:brightness(${S.br}%) sepia(${S.warm}%)${S.bg?`;background:linear-gradient(rgba(0,0,0,${S.dim}),rgba(0,0,0,${S.dim})),url("${S.bg.replace(/"/g,'%22')}") center/cover fixed`:''}}
.mention-chip-inline,.toolbar-btn.active{color:${ac}!important}.toolbar-btn.active{border-color:${ac}!important}
${S.ccss}`;
try{$pingSound.muted=S.mp;$pingSound.volume=Math.min(1,S.vol/100)}catch(e){}
if(menu){menu.style.opacity=S.op/100;menu.style.transform='scale('+S.msc+')';launcher.style.display=S.launch?'':'none'}};
const set=(k,v)=>{S[k]=v;save();apply()};

/* ───────── menu building blocks ───────── */
const btn=(t,f,ti)=>h('button',{className:'vb',textContent:t,title:ti||'',onclick:f});
const row=r=>{const [t,k,l,a,b,c]=r;
if(t==='h')return h('div',{className:'vh',textContent:k});if(t==='n')return h('div',{className:'vn',textContent:k});if(t==='x')return k();
if(t==='b')return h('div',{},k.map(([x,f,ti])=>btn(x,f,ti)));
if(t==='t'){const i=h('input',{type:'checkbox',checked:!!S[k],onchange:()=>{set(k,i.checked);a&&a(i.checked)}});return h('label',{className:'vr'},l,i)}
if(t==='r'){const v=h('span',{textContent:S[k]}),i=h('input',{type:'range',min:a,max:b,step:c||1,value:S[k],oninput:()=>{v.textContent=i.value;set(k,+i.value)}});return h('div',{className:'vr'},l,v,i)}
if(t==='s'){const o=x=>Array.isArray(x)?x:[x,x],i=h('select',{onchange:()=>set(k,i.value)},a.map(x=>h('option',{value:o(x)[0],textContent:o(x)[1],selected:o(x)[0]==S[k]})));return h('label',{className:'vr'},l,i)}
if(t==='c'){const i=h('input',{type:'color',value:S[k]||'#22c55e',oninput:()=>set(k,i.value)});return h('label',{className:'vr'},l,h('span',{},i,btn('Auto',()=>{set(k,'');i.value='#22c55e'})))}
if(t==='i')return h('div',{className:'vr col'},l,h('input',{type:'text',value:S[k]||'',oninput:e=>a?a(e.target.value):set(k,e.target.value)}));
if(t==='a')return h('div',{className:'vr col'},l,h('textarea',{rows:a||4,value:S[k]||'',oninput:e=>set(k,e.target.value)}))};

/* ───────── custom panels ───────── */
const live=(node,f,ms)=>{f();const iv=setInterval(()=>node.isConnected?f():clearInterval(iv),ms);return node};
const people=()=>{const box=h('div'),q=h('input',{className:'vi',placeholder:'Filter online users…',oninput:()=>r()}),L=h('div');box.append(q,L);
const HLC=['','#facc15','#f472b6','#38bdf8','#a78bfa','#fb923c'];
const r=()=>L.replaceChildren(...(typeof latestPresenceList!=='undefined'?latestPresenceList:[]).filter(e=>e.name.toLowerCase().includes(q.value.toLowerCase())).sort((a,b)=>a.name.localeCompare(b.name)).map(e=>{const k=e.name.toLowerCase(),ro=e.loginId&&ROLES[effectiveRoleForLoginId(e.loginId)];
return h('div',{className:'vr'},(ro?ro.icon+' ':'')+e.name+(e.name===myName?' (you)':'')+(S.muted.includes(k)?' 🔇':'')+(S.fr.includes(k)?' ⭐':''),h('span',{},
btn('🔇',()=>{if(e.name!==myName){tog('muted',k);r()}},'Mute/unmute (local)'),btn('⭐',()=>{tog('fr',k);r()},'Friend: get a toast when they join/leave'),
btn('✏️',()=>{const n=prompt('Local nickname for '+e.name+' (only you see it):',S.nick[k]||'');if(n!==null){n?S.nick[k]=n:delete S.nick[k];save();refresh();r()}},'Nickname'),
btn('🎨',()=>{S.hl[k]=HLC[(HLC.indexOf(S.hl[k]||'')+1)%HLC.length];if(!S.hl[k])delete S.hl[k];save();refresh()},'Cycle highlight color')))}));
return live(box,r,3000)};
const listNode=(key,fmt,onClick,emptyMsg)=>{const L=h('div');const r=()=>{L.replaceChildren(...(S[key].length?S[key].map((x,i)=>h('div',{className:'vr'},h('span',{textContent:fmt(x),style:'cursor:pointer;flex:1',onclick:()=>onClick(x)}),btn('✕',()=>{S[key].splice(i,1);save();r()}))):[h('div',{className:'vn',textContent:emptyMsg})]))};r();return L};
const snippets=()=>{const box=h('div'),i=h('input',{className:'vi',placeholder:'New quick reply…'});box.append(i,btn('Add',()=>{if(i.value.trim()){S.snips.push(i.value.trim());save();i.value='';box.replaceChildren(...snippets().childNodes)}}),listNode('snips',x=>x,x=>ins(x),'No quick replies yet.'));return box};
const emojis=()=>h('div',{style:'line-height:1.9'},EMO.map(e=>h('span',{textContent:e,style:'cursor:pointer;font-size:20px;padding:2px',onclick:()=>ins(e)})));
const styler=()=>{const i=h('input',{className:'vi',placeholder:'Type text, click a style to insert it into your message'}),L=h('div');i.oninput=()=>L.replaceChildren(...Object.keys(TF).filter(k=>k!=='none').map(k=>h('div',{className:'vr'},h('span',{textContent:k,style:'color:#94a3b8;width:70px'}),h('span',{textContent:TF[k](i.value||'Hello World'),style:'cursor:pointer;flex:1;word-break:break-all',onclick:()=>ins(cut(TF[k](i.value||'Hello World')))}))));i.oninput();return h('div',{},i,L)};
const preview=()=>{const p=h('div',{className:'vp'});return live(p,()=>{p.textContent='Next message will send as:\n'+($msgInput.value?tx($msgInput.value):'(type something in the chat box)')},700)};
const sched=()=>{const m=h('input',{type:'number',min:1,max:120,value:1,style:'width:60px'}),t=h('input',{className:'vi',placeholder:'Message to send later…'});
return h('div',{},t,h('div',{className:'vr'},'Send in (minutes):',m),btn('Schedule',()=>{const txt=t.value.trim();if(!txt)return;const wait=Math.max(1,+m.value||1)*60000;toast('Scheduled in '+m.value+' min');t.value='';
setTimeout(()=>{const go=()=>{const old=$msgInput.value;$msgInput.value=txt;$msgInput.dispatchEvent(new Event('input',{bubbles:true}));$sendBtn.click();setTimeout(()=>{if($msgInput.value===txt)$msgInput.value=old;else if(old&&!$msgInput.value)$msgInput.value=old;$msgInput.dispatchEvent(new Event('input',{bubbles:true}))},1800)};
const left=currentMessageCooldownMs()-(Date.now()-lastSentAt);left>0?setTimeout(go,left+100):go()},wait)}),h('div',{className:'vn',textContent:'Sends through the normal send button, so your rank delay, timeouts and bans still apply.'}))};
const dice=()=>{const R=n=>1+Math.floor(Math.random()*n),B=['Yes.','No.','Maybe.','Definitely.','Ask again later.','Not a chance.','Signs point to yes.','Very doubtful.'];
return h('div',{},[6,20,100].map(n=>btn('🎲 d'+n,()=>ins('🎲 d'+n+': '+R(n)+' '))),btn('🪙 Coin',()=>ins('🪙 '+(R(2)>1?'Heads':'Tails')+' ')),btn('🎱 8-ball',()=>ins('🎱 '+B[R(B.length)-1]+' ')))};
const timer=()=>{const m=h('input',{type:'number',min:1,max:600,value:5,style:'width:60px'});return h('div',{className:'vr'},'Timer (min):',m,btn('Start',()=>{toast('Timer started: '+m.value+' min');setTimeout(()=>{beep('bell');toast('⏰ Timer finished!')},m.value*60000)}))};
const upl=()=>h('input',{type:'file',accept:'.json',onchange:e=>{const f=e.target.files[0];if(!f)return;f.text().then(x=>{try{Object.assign(S,JSON.parse(x));save();apply();refresh();toast('Settings imported')}catch(err){toast('Bad file')}})}});
const STOP=new Set('that this with have from they been were what when your will just like about there their would could should them then than into some more very also because'.split(' '));
const stats=()=>{const p=h('div',{className:'vp'}),f=()=>{const u={},w={};LOG.forEach(m=>{u[m.n]=(u[m.n]||0)+1;(m.t.toLowerCase().match(/[a-z']{4,}/g)||[]).forEach(x=>STOP.has(x)||(w[x]=(w[x]||0)+1))});
const top=o=>Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,8),bar=(n,mx)=>'█'.repeat(Math.max(1,Math.round(n/mx*12)));const tu=top(u),tw=top(w),cut10=LOG.filter(m=>Date.now()-m.ts<6e5).length;
p.textContent='Messages seen: '+LOG.length+'  ·  last 10 min: '+cut10+'\nTop talkers\n'+(tu.map(([n,c])=>n.slice(0,12).padEnd(13)+bar(c,tu[0][1])+' '+c).join('\n')||'—')+'\n\nTop words\n'+(tw.map(([n,c])=>n.slice(0,12).padEnd(13)+bar(c,tw[0][1])+' '+c).join('\n')||'—')};f();return h('div',{},btn('Refresh stats',f),p)};
const diag=()=>live(h('div',{className:'vp'}),function(){this.textContent=['Connection: '+($onlineDot.classList.contains('offline')?'offline':'connected'),'You: '+myName+' ('+myRoleId()+')','Online: '+$onlineCount.textContent,'Messages on screen: '+$messages.querySelectorAll('.msg').length,'Seen / sent this session: '+ST.seen+' / '+ST.sent,'Server clock offset: '+Math.round(ChatBackend._offsetCache)+' ms','Session length: '+Math.round((Date.now()-ST.t0)/60000)+' min'].join('\n')},1000);
const find=q=>{q=q.toLowerCase();$messages.querySelectorAll('.msg:not(.system)').forEach(e=>e.classList.toggle('vm-nf',!!q&&!((e.dataset.vmRaw||'')+' '+(e.dataset.vmName||'')).toLowerCase().includes(q)))};
const exp=f=>{const d=new Date().toISOString().slice(0,10);
if(f==='txt')dl('vus-chat-'+d+'.txt',LOG.map(m=>`[${new Date(m.ts).toLocaleString()}] ${m.n}: ${m.t}`).join('\n'),'text/plain');
if(f==='json')dl('vus-chat-'+d+'.json',JSON.stringify(LOG,null,2),'application/json');
if(f==='csv')dl('vus-chat-'+d+'.csv','time,name,text\n'+LOG.map(m=>[new Date(m.ts).toISOString(),m.n,m.t].map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\n'),'text/csv');
if(f==='html')dl('vus-chat-'+d+'.html','<meta charset=utf-8><body style="background:#0f172a;color:#f1f5f9;font:16px Arial;max-width:700px;margin:auto">'+LOG.map(m=>`<p><b>${esc(m.n)}</b> <small style="color:#64748b">${new Date(m.ts).toLocaleString()}</small><br>${esc(m.t)}</p>`).join(''),'text/html')};
const hold=()=>{ST.hold=!ST.hold;if(!ST.hold){document.querySelectorAll('.vm-held').forEach(e=>e.classList.remove('vm-held'));toast(ST.held+' new message(s) released');ST.held=0;$messages.scrollTop=$messages.scrollHeight}else toast('Feed frozen — new messages are held back')};

/* ───────── tabs ───────── */
const SPEC={
Chat:[['h','Display'],['t','hs','Hide join/leave messages'],['t','hb','Hide rank badges'],['t','ht','Hide name/time line'],['t','cp','Compact mode'],['t','gr','Group consecutive messages'],['t','lk','Clickable links'],['t','lb','Image lightbox (click to zoom)'],['t','bi','Blur images until hover'],['t','hi','Hide all images'],
['r','fs','Message font size',12,36],['r','ms','Name/time size',9,26],['r','mw','Max bubble width %',40,100],['r','gap','Message spacing',0,32],
['h','Find & filter'],['i','','Search messages / users',find],['i','kw','Highlight + alert keywords (comma separated)'],['i','cw','Censor words (comma separated)'],
['h','Navigate'],['b',[['⏫ Top',()=>$messages.scrollTop=0],['⏬ Bottom',()=>$messages.scrollTop=$messages.scrollHeight],['📍 Last mention',()=>{const a=document.querySelectorAll('.vm-me');a.length?a[a.length-1].scrollIntoView({block:'center'}):toast('No mentions yet')}],['❄ Freeze / release feed',hold]]],
['h','Pins (local)'],['x',()=>listNode('pins',p=>p.n+': '+p.t.slice(0,60),p=>copy(p.t),'Hover a message and press 📌.')],
['h','Export chat'],['b',[['TXT',()=>exp('txt')],['JSON',()=>exp('json')],['CSV',()=>exp('csv')],['HTML',()=>exp('html')],['Copy all',()=>copy(LOG.map(m=>m.n+': '+m.t).join('\n'))]]],['h','Stats'],['x',stats]],
Write:[['h','Send transform'],['s','tf','Style every message I send',Object.keys(TF)],['i','pre','Prefix (added to every message)'],['i','suf','Suffix (added to every message)'],['t','emo',':shortcodes: → emoji (:fire: :shrug: :tableflip: :lenny:)'],['t','cap','Auto-capitalize sentences'],['t','cs','Enter = new line, Ctrl+Enter = send'],['x',preview],['n','Up/Down arrows in an empty box recall your last messages. Output is always cut to 500 chars.'],
['h','Emoji'],['x',emojis],['h','Text styler'],['x',styler],['h','Quick replies'],['x',snippets],['h','Scheduled message'],['x',sched],['h','Random (inserts into your message)'],['x',dice]],
Look:[['h','Theme'],['s','theme','Preset',Object.keys(THEMES)],['c','ac','Accent color'],['s','bs','Bubble style',['round','square','pill','glass','outline','neon']],['s','font','Font',[['system-ui,Arial,sans-serif','System'],['Georgia,serif','Serif'],['ui-monospace,Consolas,monospace','Mono'],['"Comic Sans MS","Comic Neue",cursive','Comic'],['Verdana,sans-serif','Verdana']]],
['r','zoom','Page zoom',.7,1.5,.05],['t','zen','Zen mode (hide header, toolbar, typing bar)'],['t','an','Message pop-in animation'],['t','ag','Animated gradient background'],
['h','Background image'],['i','bg','Image URL (https://… or data:)'],['r','dim','Dim background',0,.9,.05],['h','Filters (message area)'],['r','br','Brightness %',40,140],['r','warm','Warm / night tint %',0,80],['h','Custom CSS'],['a','ccss','',6]],
Alerts:[['t','dnd','Do Not Disturb (silences everything here)'],['s','snd','Message sound',[['off','Off'],['mention','Mentions + keywords'],['all','Every new message']]],['s','st','Sound',['blip','chime','pop','bell']],['r','vol','Volume',0,100],['b',[['▶ Test sound',()=>beep()]]],['t','mp','Mute the built-in ping sound'],
['t','dn','Desktop notifications when tab is hidden',v=>{if(v&&window.Notification)Notification.requestPermission()}],['t','ut','Unread count in tab title'],['t','fv','Unread badge on favicon'],['t','fl','Flash screen on mention'],['t','vib','Vibrate on mention'],['t','tts','Read new messages aloud'],['t','ttsm','…only mentions/keywords'],['r','rate','Voice speed',.5,2,.1]],
People:[['n','Mute, nickname, highlight and ⭐ friends are local — only you see them. Friends trigger a toast when they join/leave.'],['x',people],['h','Muted'],['x',()=>listNode('muted',x=>'🔇 '+x+'  (click ✕ to unmute)',()=>{},'Nobody muted.')],['h','Friends'],['x',()=>listNode('fr',x=>'⭐ '+x,()=>{},'No friends starred.')]],
Tools:[['h','Notepad'],['a','note','',6],['b',[['Copy',()=>copy(S.note)],['Insert into message',()=>ins(S.note)]]],['h','Timer'],['x',timer],['h','Diagnostics'],['x',diag],['b',[['Force reconnect',()=>{try{firebase.database().goOffline();setTimeout(()=>firebase.database().goOnline(),600);toast('Reconnecting…')}catch(e){}}],['Scroll chat to bottom',()=>$messages.scrollTop=$messages.scrollHeight]]]],
Menu:[['h','Window'],['r','op','Menu opacity %',40,100],['r','msc','Menu scale',.7,1.3,.05],['t','lock','Lock menu position'],['t','snap','Snap to screen edges'],['t','launch','Show 🧰 launcher button'],['t','open','Open menu on page load'],
['b',[['Reset position',()=>{S.pos=S.lpos=null;save();place0()}],['Minimize',()=>menu.classList.toggle('min')]]],['n','Hotkeys: Alt+M toggles the menu · Alt+H panic-hides menu and launcher.'],
['h','Settings'],['b',[['Export settings',()=>dl('vus-mod-settings.json',JSON.stringify(S,null,2),'application/json')],['Reset everything',()=>{if(confirm('Reset all mod menu settings?')){localStorage.removeItem(LS);location.reload()}}]]],['x',upl]]};
let cur='Chat';
const body=h('div',{className:'vbody'}),tabs=h('div',{className:'vtabs'});
const show=n=>{cur=n;[...tabs.children].forEach(b=>b.classList.toggle('on',b.textContent===n));body.replaceChildren(...SPEC[n].map(row));body.scrollTop=0};

/* ───────── window + dragging ───────── */
const place=(el,x,y)=>{el.style.right=el.style.bottom='auto';el.style.left=Math.max(0,Math.min(innerWidth-50,x))+'px';el.style.top=Math.max(0,Math.min(innerHeight-40,y))+'px'};
const drag=(el,hd,key)=>{let sx,sy,ox,oy,on=0;hd.style.touchAction='none';hd.moved=0;
hd.addEventListener('pointerdown',e=>{if(e.target.closest('button')&&hd!==el)return;if(S.lock&&key==='pos')return;hd.setPointerCapture(e.pointerId);sx=e.clientX;sy=e.clientY;const r=el.getBoundingClientRect();ox=r.left;oy=r.top;on=1;hd.moved=0});
hd.addEventListener('pointermove',e=>{if(!on)return;const dx=e.clientX-sx,dy=e.clientY-sy;hd.moved=Math.max(hd.moved,Math.abs(dx)+Math.abs(dy));if(hd.moved>3)place(el,ox+dx,oy+dy)});
hd.addEventListener('pointerup',()=>{if(!on)return;on=0;if(hd.moved<=3)return;if(S.snap){const r=el.getBoundingClientRect();let x=r.left,y=r.top;if(x<40)x=8;if(innerWidth-r.right<40)x=innerWidth-r.width-8;if(y<40)y=8;if(innerHeight-r.bottom<40)y=innerHeight-r.height-8;place(el,x,y)}S[key]=[el.offsetLeft,el.offsetTop];save()})};
const place0=()=>{S.pos?place(menu,...S.pos):place(menu,innerWidth-420,70);S.lpos?place(launcher,...S.lpos):place(launcher,innerWidth-70,innerHeight-130)};
const toggle=v=>{menu.classList.toggle('on',v);S.open=menu.classList.contains('on');save()};

/* ───────── boot ───────── */
const build=()=>{
const hd=h('div',{className:'vhd'},h('span',{textContent:'🧰 VUS Mod Menu'}),h('span',{},h('button',{textContent:'—',title:'Minimize',onclick:()=>menu.classList.toggle('min')}),h('button',{textContent:'✕',title:'Close',onclick:()=>toggle(false)})));
menu=h('div',{id:'vm'},hd,tabs,body);launcher=h('button',{id:'vml',textContent:'🧰',title:'Mod menu (Alt+M)'});
Object.keys(SPEC).forEach(n=>tabs.append(h('button',{textContent:n,onclick:()=>show(n)})));
document.body.append(menu,launcher);drag(menu,hd,'pos');drag(launcher,launcher,'lpos');
launcher.addEventListener('click',()=>{if(!launcher.moved)toggle()});
show(cur);place0();apply();if(S.open)menu.classList.add('on');
addEventListener('resize',()=>{place(menu,menu.offsetLeft,menu.offsetTop);place(launcher,launcher.offsetLeft,launcher.offsetTop)});
document.addEventListener('keydown',e=>{if(e.altKey&&e.code==='KeyM'){e.preventDefault();toggle()}if(e.altKey&&e.code==='KeyH'){e.preventDefault();document.documentElement.classList.toggle('vm-panic')}});
/* message hooks */
new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>n.nodeType===1&&n.classList.contains('msg')&&proc(n)))).observe($messages,{childList:true});
$messages.querySelectorAll('.msg').forEach(proc);
$messages.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a');if(S.lb&&a&&a.querySelector('img')){e.preventDefault();const o=h('div',{className:'vlb',onclick:()=>o.remove()},h('img',{src:a.href}));document.body.append(o)}},true);
/* send hook: transforms text, then the app's own ChatBackend.send runs unchanged */
const o=ChatBackend.send;ChatBackend.send=function(n,t,m,i){ST.sent++;S.hist=[t,...S.hist.filter(x=>x!==t)].slice(0,30);save();return o.call(this,n,tx(t),m,i)};
let hi=-1;$msgInput.addEventListener('keydown',e=>{
if(S.cs&&e.key==='Enter'){if(e.ctrlKey||e.metaKey){e.preventDefault();e.stopImmediatePropagation();$sendBtn.click()}else if(!e.shiftKey)e.stopImmediatePropagation();return}
if((e.key==='ArrowUp'||e.key==='ArrowDown')&&S.hist.length&&($msgInput.value===''||hi>=0)){e.preventDefault();hi=e.key==='ArrowUp'?Math.min(hi+1,S.hist.length-1):hi-1;$msgInput.value=hi<0?'':S.hist[hi];$msgInput.dispatchEvent(new Event('input',{bubbles:true}))}},true);
$msgInput.addEventListener('input',()=>{if($msgInput.value==='')hi=-1});
/* friends watcher */
let prev=null;setInterval(()=>{if(typeof latestPresenceList==='undefined')return;const now=new Set(latestPresenceList.map(e=>e.name));if(prev){now.forEach(n=>!prev.has(n)&&S.fr.includes(n.toLowerCase())&&(toast('⭐ '+n+' came online'),!S.dnd&&beep('chime')));prev.forEach(n=>!now.has(n)&&S.fr.includes(n.toLowerCase())&&toast('⭐ '+n+' went offline'))}prev=now},3000);
window.VUSMod={settings:()=>S,open:()=>toggle(true),close:()=>toggle(false)};
};
try{build()}catch(err){console.error('VUS Mod Menu failed to start:',err)}
})();
