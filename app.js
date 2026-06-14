const cards = [
 {name:'Hiposaurus', type:'danger', count:'players-1', img:'a_single_illustrated_game_card_in_a_vertical_recta.webp', text:'When you draw this card, you are lunch unless you use Hippo Treat.'},
 {name:'Hippo Treat', type:'defuse', count:6, img:'a_full_color_illustrated_playing_card_game_card.webp', text:'Use automatically when you draw Hiposaurus. Then hide Hiposaurus at the bottom of the draw pile.'},
 {name:'Stampede', type:'action', count:4, img:'a_full_color_illustrated_game_card_design_in_a_por.webp', text:'End your turn without drawing. The next player must survive 2 draw turns.'},
 {name:'Play Dead', type:'action', count:4, img:'a_single_illustrated_game_card_design_overall_sce.webp', text:'End one of your required draw turns without drawing a card.'},
 {name:'Share Snacks', type:'action', count:4, img:'a_colorful_illustrated_game_card_poster_layout.webp', text:'Choose a player. They give you 1 random card from their hand.'},
 {name:'Lost in the Swamp', type:'action', count:4, img:'a_full_color_illustrated_game_card_design_overall.webp', text:'Shuffle the draw pile.'},
 {name:'Hippo Vision', type:'action', count:5, img:'a_full_frame_illustrated_game_card_design._overall.webp', text:'Privately look at the top 3 cards. Keep, reverse, or shuffle them.'},
 {name:'Not Today!', type:'reaction', count:5, img:'a_full_card_illustration_game_card_artwork._overal.webp', text:'Cancel an action card before it takes effect.'},
 {name:'Rewrite the Tracks', type:'action', count:4, img:'a_full_card_illustration_in_a_cartoon_board_game_a.webp', text:'Take the bottom card of the draw pile and put it on top.'},
 {name:'Intern Meerkats', type:'ally', count:4, img:'a_full_color_illustrated_game_card_layout_cartoon.webp', text:'Ally. 2 identical steal random. 3 identical request specific. 5 different take from discard.'},
 {name:'Drama Flamingos', type:'ally', count:4, img:'a_full_color_illustrated_game_card_poster_boardgam.webp', text:'Ally card. Same combo rules as every Ally card.'},
 {name:'Panic Monkeys', type:'ally', count:4, img:'a_full_color_illustrated_game_card_poster_style.webp', text:'Ally card. Same combo rules as every Ally card.'},
 {name:'Conspiracy Crocodiles', type:'ally', count:4, img:'a_full_frame_illustrated_game_card_poster_design.webp', text:'Ally card. Same combo rules as every Ally card.'},
 {name:'Emotional Zebras', type:'ally', count:4, img:'a_full_color_illustrated_game_card_poster_layout.webp', text:'Ally card. Same combo rules as every Ally card.'}
];
const allyNames = cards.filter(c=>c.type==='ally').map(c=>c.name);
const playerThemes = [
 {accent:'#c70d5f', soft:'#fff0f7', name:'Berry'},
 {accent:'#115aa0', soft:'#eef6ff', name:'River'},
 {accent:'#3b7d25', soft:'#f0ffec', name:'Jungle'},
 {accent:'#f05a12', soft:'#fff4e9', name:'Dust'},
 {accent:'#69338a', soft:'#f8efff', name:'Violet'}
];
let state = {players:[], deck:[], discard:[], turn:0, turnDraws:1, queuedDraws:[], started:false, selectedIndex:null, locked:false};
const $ = s => document.querySelector(s);
function uid(){return crypto.randomUUID?.() || String(Math.random()).slice(2)}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function cloneCard(c){return {...c,id:uid()}}
function cardDef(name){return cards.find(c=>c.name===name)}
function buildDeck(n){let deck=[]; for(const c of cards){let count=c.name==='Hiposaurus'?n-1:c.count; for(let i=0;i<count;i++)deck.push(cloneCard(c));} return shuffle(deck)}
function log(t){const el=$('#log'); if(!el) return; const line=document.createElement('div'); line.textContent='• '+t; el.prepend(line); while(el.children.length>16) el.lastChild.remove()}
function status(t){$('#status').textContent=t; log(t)}
function current(){return state.players[state.turn]}
function alivePlayers(){return state.players.filter(p=>!p.dead)}
function setupNames(){ const n=Math.max(2,Math.min(5,+$('#players').value||4)); const old=[...document.querySelectorAll('#nameFields input')].map(x=>x.value); const box=$('#nameFields'); box.innerHTML=''; for(let i=0;i<n;i++){ const inp=document.createElement('input'); inp.id='pname'+i; inp.value=old[i] || `Explorer ${i+1}`; inp.placeholder=`Player ${i+1}`; box.appendChild(inp);} }
function getNames(n){return Array.from({length:n},(_,i)=>$('#pname'+i)?.value?.trim() || `Explorer ${i+1}`)}
function start(){
 const n=Math.max(2,Math.min(5,+$('#players').value||4)); const names=getNames(n);
 const cleanDeck=buildDeck(n).filter(c=>c.name!=='Hiposaurus' && c.name!=='Hippo Treat');
 state={players:[],deck:cleanDeck,discard:[],turn:0,turnDraws:1,queuedDraws:Array(n).fill(0),started:true,selectedIndex:null,locked:false};
 for(let i=0;i<n;i++) state.players.push({name:names[i],dead:false,theme:playerThemes[i],hand:[cloneCard(cardDef('Hippo Treat'))]});
 for(let i=0;i<Math.max(0,6-n);i++) state.deck.push(cloneCard(cardDef('Hippo Treat')));
 shuffle(state.deck);
 for(let r=0;r<4;r++) state.players.forEach(p=>p.hand.push(state.deck.pop()));
 for(let i=0;i<n-1;i++) state.deck.push(cloneCard(cardDef('Hiposaurus')));
 shuffle(state.deck);
 $('#setupPanel').classList.remove('open');
 status(`Game started. ${state.players[0].name} begins. Draw pile contains ${n-1} hidden Hiposaurus card${n-1===1?'':'s'}.`); render(); showTurnOverlay(state.turn);
}
function aliveIndexAfter(i){let guard=0, j=i; do{j=(j+1)%state.players.length; guard++;}while(state.players[j].dead && guard<20); return j}
function beginTurn(i){state.turn=i; state.turnDraws=state.queuedDraws[i] || 1; state.queuedDraws[i]=0; state.selectedIndex=null; status(`${current().name}'s turn. Required draws: ${state.turnDraws}.`); render(); showTurnOverlay(i);}
function advanceTurn(){ if(alivePlayers().length<=1){const w=alivePlayers()[0]?.name || 'Nobody'; status(`${w} wins!`); render(); showEvent({kind:'win',title:'🏆 WINNER!',text:`${w} is the last explorer standing.`,button:'New game?',onClose:()=>{}}); return;} beginTurn(aliveIndexAfter(state.turn)); }
function endOneDrawSafely(){state.turnDraws--; if(state.turnDraws<=0) advanceTurn(); else {status(`${current().name} still has ${state.turnDraws} required draw turn(s).`); render();}}
function showEvent({kind='action',title,text,img,button='Continue',onClose}){ state.locked=true; const overlay=$('#eventOverlay'), card=$('#eventCard'); card.className='eventCard '+kind; card.innerHTML=`${img?`<img class="eventImg" src="assets/${img}" alt="">`:''}<h2>${title}</h2><p>${text}</p><button id="eventOk">${button}</button>`; overlay.classList.add('open'); const ok=$('#eventOk'); ok.onclick=()=>{overlay.classList.remove('open'); state.locked=false; if(onClose) onClose(); render();}; }
function showTurnOverlay(i){ const p=state.players[i]; document.documentElement.style.setProperty('--player-accent',p.theme.accent); document.documentElement.style.setProperty('--player-soft',p.theme.soft); showEvent({kind:'turn',title:`${p.name}'s turn`,text:`Pass the device to ${p.name}. Required draws: ${state.turnDraws}. The whole table color now matches this player.`,button:'Start turn'}); }
function draw(){
 if(state.locked) return; if(!state.started) return status('Start a new game first.'); const p=current(); if(p.dead) return advanceTurn();
 if(!state.deck.length) return status('Deck empty. No one else becomes lunch. Start a new game.');
 const c=state.deck.pop(); render();
 if(c.name==='Hiposaurus'){
  const treatIdx=p.hand.findIndex(x=>x.name==='Hippo Treat');
  if(treatIdx>=0){ const treat=p.hand.splice(treatIdx,1)[0]; state.discard.push(treat); state.deck.unshift(c); status(`${p.name} drew Hiposaurus, used Hippo Treat, and hid it at the bottom of the pile.`); showEvent({kind:'danger defused',title:'🦛 HIPOSAURUS!',img:c.img,text:`${p.name} drew the Hiposaurus! A Hippo Treat was used automatically. The monster was pushed to the bottom of the draw pile.`,button:'Survived',onClose:endOneDrawSafely}); }
  else { p.dead=true; state.discard.push(c); status(`${p.name} drew Hiposaurus and became lunch.`); showEvent({kind:'danger eaten',title:'🦛 HIPOSAURUS!',img:c.img,text:`${p.name} has no Hippo Treat. They are lunch and are out of the game.`,button:'Oh no',onClose:endOneDrawSafely}); }
 } else { p.hand.push(c); status(`${p.name} drew ${c.name}.`); showEvent({kind:'draw',title:`Drew ${c.name}`,img:c.img,text:`${p.name} added this card to their hand.`,button:'Continue',onClose:endOneDrawSafely}); }
}
function discardFromHand(player, idx){const [c]=player.hand.splice(idx,1); state.discard.push(c); return c}
function showModal(title, body){$('#modalTitle').textContent=title; $('#modalBody').innerHTML=body; $('#modal').classList.add('open')}
function choose(title, choices, cb){ showModal(title, `<div class="choiceGrid">${choices.map((x,i)=>`<button data-choice="${i}"><b>${x.title}</b><br><span>${x.sub||''}</span></button>`).join('')}</div>`); $('#modalBody').querySelectorAll('button').forEach(btn=>btn.onclick=()=>{ $('#modal').classList.remove('open'); cb(choices[+btn.dataset.choice].value); }); }
function cancelByNotToday(actorIndex, after){
 const candidates=state.players.map((p,i)=>({p,i})).filter(x=>x.i!==actorIndex && !x.p.dead && x.p.hand.some(c=>c.name==='Not Today!'));
 if(!candidates.length) return after(false);
 choose('Cancel with Not Today?', [{title:'No cancel',value:null},...candidates.map(x=>({title:x.p.name,sub:'Play Not Today!',value:x.i}))], val=>{
  if(val==null) return after(false); const p=state.players[val]; const idx=p.hand.findIndex(c=>c.name==='Not Today!'); state.discard.push(p.hand.splice(idx,1)[0]); status(`${p.name} played Not Today! The action was cancelled.`); showEvent({kind:'cancel',title:'✋ NOT TODAY!',img:cardDef('Not Today!').img,text:`${p.name} cancelled the action before it took effect.`,button:'Blocked',onClose:()=>after(true)});
 });
}
function selectTarget(excludeSelf, cb){ const choices=state.players.map((p,i)=>({p,i})).filter(x=>!x.p.dead && (!excludeSelf || x.i!==state.turn)); choose('Choose a player', choices.map(x=>({title:x.p.name,sub:`${x.p.hand.length} cards`,value:x.i})), cb); }
function playSelected(){ const i=state.selectedIndex; if(i==null) return status('Select a card first.'); playCard(i); }
function playCard(i){
 if(state.locked) return; if(!state.started) return status('Start a new game first.'); const p=current(); const c=p.hand[i]; if(!c) return;
 if(c.type==='danger') return status('You cannot play Hiposaurus from your hand. It is only dangerous when drawn.');
 if(c.type==='defuse') return status('Keep Hippo Treat. It is used automatically when Hiposaurus appears.');
 if(c.name==='Not Today!') return status('Not Today! is a reaction. It appears as a choice when another player uses an action.');
 if(c.type==='ally') return playAlly(i);
 discardFromHand(p,i); state.selectedIndex=null; render();
 showEvent({kind:'play',title:c.name,img:c.img,text:`${p.name} played ${c.name}. Other players may block it with Not Today!`,button:'Resolve',onClose:()=>cancelByNotToday(state.turn, cancelled=>{ if(!cancelled) resolveAction(c); })});
}
function resolveAction(c){ const p=current();
 if(c.name==='Play Dead'){status(`${p.name} played Play Dead.`); showEvent({kind:'safe',title:'😵 PLAY DEAD',img:c.img,text:`${p.name} avoids one required draw.`,button:'Continue',onClose:endOneDrawSafely});}
 else if(c.name==='Stampede'){ const next=aliveIndexAfter(state.turn); state.queuedDraws[next]=Math.max(state.queuedDraws[next],2); status(`${p.name} played Stampede. ${state.players[next].name} must survive 2 draw turns.`); showEvent({kind:'stampede',title:'💥 STAMPEDE!',img:c.img,text:`${state.players[next].name} must survive 2 draw turns next.`,button:'Run!',onClose:advanceTurn});}
 else if(c.name==='Share Snacks'){ selectTarget(true, ti=>{ const tp=state.players[ti]; if(!tp.hand.length) status(`${tp.name} has no cards to give.`); else {const ri=Math.floor(Math.random()*tp.hand.length); const stolen=tp.hand.splice(ri,1)[0]; p.hand.push(stolen); status(`${tp.name} gave ${p.name} one random card.`)} showEvent({kind:'snack',title:'🍉 SHARE SNACKS',img:c.img,text:`${p.name} took one random card from ${tp.name}.`,button:'Continue'}); render(); }); }
 else if(c.name==='Lost in the Swamp'){shuffle(state.deck); status(`${p.name} shuffled the draw pile.`); showEvent({kind:'swamp',title:'🌀 LOST IN THE SWAMP',img:c.img,text:'The draw pile was shuffled. Nobody knows where the Hiposaurus is now.',button:'Continue'});}
 else if(c.name==='Hippo Vision'){visionModal();}
 else if(c.name==='Rewrite the Tracks'){const bottom=state.deck.shift(); if(bottom) state.deck.push(bottom); status(`${p.name} moved the bottom card to the top of the draw pile.`); showEvent({kind:'tracks',title:'⏱ REWRITE THE TRACKS',img:c.img,text:'The bottom card of the draw pile was moved to the top.',button:'Continue'});}
 render();
}
function visionModal(){ const top=state.deck.slice(-3).reverse(); if(!top.length) return status('No cards to view.'); const body=`<p class="rulesList"><b>Top of deck:</b><br>${top.map((c,i)=>`${i+1}. ${c.name}`).join('<br>')}</p><div class="choiceGrid"><button id="keep">Keep order</button><button id="reverse">Reverse order</button><button id="mix">Shuffle these 3</button></div>`; showModal('Hippo Vision', body); const pulled=()=>state.deck.splice(Math.max(0,state.deck.length-3)).reverse(); $('#keep').onclick=()=>{const a=pulled(); state.deck.push(...a.reverse()); closeAnd('Kept the top 3 as they were.');}; $('#reverse').onclick=()=>{const a=pulled().reverse(); state.deck.push(...a.reverse()); closeAnd('Reversed the top 3 cards.');}; $('#mix').onclick=()=>{const a=shuffle(pulled()); state.deck.push(...a.reverse()); closeAnd('Shuffled the top 3 cards.');}; }
function closeAnd(t){$('#modal').classList.remove('open'); status(t); render()}
function playAlly(idx){ const p=current(); const name=p.hand[idx].name; const same=p.hand.filter(c=>c.name===name).length; const different=allyNames.filter(n=>p.hand.some(c=>c.name===n)).length; const choices=[]; if(same>=2) choices.push({title:'Play 2 identical',sub:'Steal 1 random card',value:'2'}); if(same>=3) choices.push({title:'Play 3 identical',sub:'Request a specific card',value:'3'}); if(different>=5) choices.push({title:'Play 5 different allies',sub:'Take any card from discard',value:'5'}); if(!choices.length) return status(`You need 2 identical ${name}, 3 identical, or 5 different Ally cards.`); choose('Choose Ally combo', choices, ans=>resolveAlly(ans,name)); }
function resolveAlly(ans,name){ const p=current(); if(ans==='2'){removeCards(p,name,2); selectTarget(true,ti=>{const tp=state.players[ti]; if(!tp.hand.length) status(`${tp.name} has no cards.`); else {const ri=Math.floor(Math.random()*tp.hand.length); p.hand.push(tp.hand.splice(ri,1)[0]); status(`${p.name} played a pair of ${name} and stole 1 random card from ${tp.name}.`)} showEvent({kind:'ally',title:`PAIR: ${name}`,img:cardDef(name).img,text:`${p.name} stole one random card from ${tp.name}.`,button:'Continue'}); render();});}
 else if(ans==='3'){removeCards(p,name,3); selectTarget(true,ti=>{ const requested=prompt('Type the exact card name you request:'); const tp=state.players[ti]; const ri=tp.hand.findIndex(c=>c.name.toLowerCase()===(requested||'').toLowerCase()); if(ri>=0){p.hand.push(tp.hand.splice(ri,1)[0]); status(`${tp.name} had it. ${p.name} took ${requested}.`)} else status(`${tp.name} did not have ${requested}.`); showEvent({kind:'ally',title:`TRIPLE: ${name}`,img:cardDef(name).img,text:`${p.name} requested ${requested || 'a card'} from ${tp.name}.`,button:'Continue'}); render(); });}
 else if(ans==='5'){for(const n of allyNames){const i=p.hand.findIndex(c=>c.name===n); if(i>=0) state.discard.push(p.hand.splice(i,1)[0]);} const pool=state.discard.filter(c=>c.name!=='Hiposaurus'); const names=[...new Set(pool.map(c=>c.name))]; if(!names.length) return status('Discard pile has no card you can take.'); choose('Take from discard', names.map(n=>({title:n,value:n})), pick=>{const di=state.discard.findIndex(c=>c.name===pick); if(di>=0){p.hand.push(state.discard.splice(di,1)[0]); status(`${p.name} took ${pick} from discard.`)} showEvent({kind:'ally',title:'5 DIFFERENT ALLIES',text:`${p.name} took ${pick} from the discard pile.`,button:'Continue'}); render();}); }}
function removeCards(p,name,n){let removed=0; for(let i=p.hand.length-1;i>=0&&removed<n;i--){if(p.hand[i].name===name){state.discard.push(p.hand.splice(i,1)[0]); removed++;}} state.selectedIndex=null;}
function selectPlayer(i){ if(!state.started) return; if(i!==state.turn){return status(`It is ${current().name}'s turn. Player tiles are status only; turns change automatically.`)} showTurnOverlay(i); }
function selectCard(i){if(state.locked)return; state.selectedIndex=i; render();}
function render(){
 const p=current(); if(p){document.documentElement.style.setProperty('--player-accent',p.theme.accent); document.documentElement.style.setProperty('--player-soft',p.theme.soft)}
 $('#deckCount').textContent=state.started?`${state.deck.length}\nCARDS`:'DECK';
 $('#turnInfo').textContent=state.started?`${current().name}\n${state.turnDraws} required draw${state.turnDraws===1?'':'s'}`:'No game running';
 $('#discardInfo').textContent=`Discard: ${state.discard.length}`;
 $('#playersView').innerHTML=state.players.map((p,i)=>`<button class="player ${i===state.turn?'active':''} ${p.dead?'dead':''}" style="--p:${p.theme.accent};--ps:${p.theme.soft}" onclick="selectPlayer(${i})"><b>${i===state.turn?'▶ ':''}${p.name}</b><span>${p.dead?'Lunch':'Alive'} · ${p.hand.length} cards</span>${state.queuedDraws[i]?`<em>${state.queuedDraws[i]} queued</em>`:''}</button>`).join('');
 const hand=$('#hand'); hand.innerHTML=''; (p?.hand||[]).forEach((c,i)=>{const el=tile(c); if(i===state.selectedIndex) el.classList.add('selected'); el.onclick=()=>selectCard(i); hand.appendChild(el)});
 $('#handTitle').textContent=p?`${p.name}'s hand`:'Current hand'; renderSelected();
}
function renderSelected(){ const p=current(); const c=p?.hand?.[state.selectedIndex]; const panel=$('#selectedCard'), actions=$('#actionButtons'); actions.innerHTML=''; if(!c){panel.innerHTML='<b>Select a card</b><span>Tap a card in the hand to see what it can do. Player turns change automatically after drawing or turn-ending actions.</span>'; return;} panel.innerHTML=`<img src="assets/${c.img}" alt="${c.name}"><b>${c.name}</b><span>${c.text}</span>`; const play=document.createElement('button'); play.textContent = c.type==='defuse'?'Held automatically': c.name==='Not Today!'?'Reaction only':'Play card'; play.onclick=playSelected; actions.appendChild(play); const read=document.createElement('button'); read.className='secondaryAction'; read.textContent='Explain'; read.onclick=()=>showModal(c.name,`<p class="rulesList">${c.text}</p><img style="width:100%;max-height:60vh;object-fit:contain" src="assets/${c.img}">`); actions.appendChild(read); }
function tile(c){const el=document.createElement('div'); el.className='cardTile '+c.type; el.innerHTML=`<img src="assets/${c.img}" alt="${c.name}"><b>${c.name}</b><p>${c.text}</p>`; return el}
function rules(){showModal('Quick rules',`<div class="rulesList"><p><b>Goal:</b> be the last explorer alive.</p><p><b>Turn:</b> play as many cards as you want, then draw 1 card to end your turn.</p><p><b>Hiposaurus:</b> a big animated alert appears when drawn. You are out unless you have Hippo Treat.</p><p><b>Hippo Treat:</b> used automatically, then Hiposaurus is hidden at the bottom of the deck.</p><p><b>Ally cards:</b> play 2 identical to steal random; 3 identical to request a specific card; 5 different to take from discard.</p><p><b>Turns:</b> the board color changes for each player. Pass the device when the turn overlay appears.</p></div>`)}
$('#players').oninput=setupNames; $('#setupBtn').onclick=()=>$('#setupPanel').classList.toggle('open'); $('#newGame').onclick=start; $('#drawBtn').onclick=draw; $('#drawBtn').onkeydown=e=>{if(e.key==='Enter'||e.key===' ') draw()}; $('#endBtn').onclick=()=>status('Normal turns end by drawing. To avoid drawing, play Play Dead or Stampede.'); $('#rulesBtn').onclick=rules; $('#closeModal').onclick=()=>$('#modal').classList.remove('open'); setupNames(); render(); window.selectPlayer=selectPlayer;
