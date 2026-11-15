import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Trophy, Coins, Palette, Map, Dumbbell, Upload, TrainFront, Zap, Lock, Smartphone, Monitor } from 'lucide-react';

type Mode = 'classic' | 'training';
type MapId = 'neon' | 'sunset' | 'forest';
const maps: {id:MapId; name:string; detail:string; sky:string; ground:string; accent:string}[] = [
  {id:'neon',name:'Neon District',detail:'Cidade futurista',sky:'#21113d',ground:'#17132b',accent:'#b66cff'},
  {id:'sunset',name:'Golden Coast',detail:'Fim de tarde',sky:'#713d55',ground:'#38243d',accent:'#ffb45e'},
  {id:'forest',name:'Moss Valley',detail:'Trilha verde',sky:'#163d3b',ground:'#142b2b',accent:'#7ee0a1'}
];
const readImage = (file:File, done:(v:string)=>void) => {
  if (!file.type.startsWith('image/')) return;
  if (file.size > 1024 * 1024) { alert('A imagem precisa ter até 1 MB.'); return; }
  const reader = new FileReader(); reader.onload = () => done(String(reader.result)); reader.readAsDataURL(file);
};

function Runner({map,mode,onEnd,onCoins}:{map:typeof maps[number];mode:Mode;onEnd:(score:number,coins:number)=>void;onCoins:(n:number)=>void}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running,setRunning] = useState(true);
  const [score,setScore] = useState(0);
  const [collected,setCollected] = useState(0);
  const [lane,setLane] = useState(1);
  const [jump,setJump] = useState(0);
  const [slide,setSlide] = useState(false);
  const state = useRef({lane:1,jump:0,slide:false,items:[] as {lane:number;y:number;kind:'block'|'barrier'|'coin'}[],tick:0,score:0,coins:0,over:false});
  const touch = useRef<{x:number;y:number}|null>(null);
  useEffect(()=>{state.current.lane=lane;},[lane]);
  useEffect(()=>{state.current.jump=jump;state.current.slide=slide;},[jump,slide]);
  useEffect(()=>{
    const c=canvasRef.current; const ctx=c?.getContext('2d'); if(!c||!ctx)return;
    let raf=0; let last=0; let spawn=0;
    const draw=(t:number)=>{
      if(!running || state.current.over)return;
      const s=state.current; const dt=Math.min((t-last)/16.67||1,2); last=t;
      const w=c.width= Math.max(320,c.clientWidth*devicePixelRatio); const h=c.height=Math.max(420,c.clientHeight*devicePixelRatio);
      ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle=map.sky;ctx.fillRect(0,0,w,h);
      const horizon=h*.22, mid=w/2;
      ctx.fillStyle='#ffffff12'; for(let i=0;i<9;i++){const x=(i*137+(t*.025)%w)%w;ctx.fillRect(x,horizon-50-(i%3)*24,28+(i%3)*12,70+(i%3)*24);}
      ctx.fillStyle=map.ground;ctx.beginPath();ctx.moveTo(w*.18,horizon);ctx.lineTo(w*.82,horizon);ctx.lineTo(w*1.15,h);ctx.lineTo(-w*.15,h);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#ffffff33';ctx.lineWidth=3;for(let i=0;i<2;i++){ctx.beginPath();ctx.moveTo(mid+(i-.5)*w*.16,horizon);ctx.lineTo(mid+(i-.5)*w*.68,h);ctx.stroke();}
      ctx.strokeStyle='#ffffff25';ctx.lineWidth=2;for(let i=0;i<10;i++){const y=horizon+((i*65+(t*.24))%(h-horizon));const p=(y-horizon)/(h-horizon);ctx.beginPath();ctx.moveTo(w*(.18-p*.33),y);ctx.lineTo(w*(.82+p*.33),y);ctx.stroke();}
      s.tick+=dt;s.score+=dt*.12;spawn+=dt;
      if(spawn>Math.max(28,56-s.score*.025)){spawn=0;const r=Math.random();s.items.push({lane:Math.floor(Math.random()*3),y:horizon,kind:r<.48?'coin':r<.76?'block':'barrier'});}
      for(const item of s.items){item.y+=dt*(3.3+s.score*.009)*(1+(item.y-horizon)/h*.5);const p=Math.max(0,(item.y-horizon)/(h-horizon));const x=mid+(item.lane-1)*w*(.13+p*.17);const size=13+p*26;
        if(item.kind==='coin'){ctx.fillStyle='#ffd75c';ctx.beginPath();ctx.arc(x,item.y,size*.55,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff1a6';ctx.lineWidth=3;ctx.stroke();}
        else {ctx.fillStyle=item.kind==='block'?'#e46c85':'#5fc4e8';ctx.fillRect(x-size,item.y-size,size*2,size*1.7);ctx.fillStyle='#ffffff55';ctx.fillRect(x-size+5,item.y-size+5,size*.45,5);}
      }
      const playerX=mid+(s.lane-1)*w*.22, playerY=h*.78-(s.jump>0?Math.sin(s.jump*Math.PI/18)*h*.13:0);
      ctx.fillStyle='#00000044';ctx.beginPath();ctx.ellipse(playerX,h*.8,24,8,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=map.accent;ctx.beginPath();ctx.roundRect(playerX-17,playerY-39,34,s.slide?25:43,10);ctx.fill();
      ctx.fillStyle='#f5d5bd';ctx.beginPath();ctx.arc(playerX,playerY-49,13,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#21172c';ctx.fillRect(playerX-13,playerY-56,26,8);
      if(s.jump>0)s.jump=Math.max(0,s.jump-dt); 
      s.items=s.items.filter(it=>{if(it.y>h*.70 && it.y<h*.86 && it.lane===s.lane){if(it.kind==='coin'){s.coins++;setCollected(s.coins);onCoins(s.coins);return false;}if(!(s.jump>0 || (it.kind==='barrier'&&s.slide))){s.over=true;setRunning(false);setScore(Math.floor(s.score));onEnd(Math.floor(s.score),s.coins);return false;}}return it.y<h+40;});
      setScore(Math.floor(s.score)); raf=requestAnimationFrame(draw);
    };
    raf=requestAnimationFrame(draw);return()=>cancelAnimationFrame(raf);
  },[running,map,onEnd,onCoins]);
  const act=(a:'left'|'right'|'jump'|'slide')=>{if(!running)return;const s=state.current;if(a==='left')setLane(v=>Math.max(0,v-1));if(a==='right')setLane(v=>Math.min(2,v+1));if(a==='jump'){setJump(18);s.jump=18;}if(a==='slide'){setSlide(true);s.slide=true;window.setTimeout(()=>{setSlide(false);s.slide=false;},550);}};
  useEffect(()=>{const key=(e:KeyboardEvent)=>{if(['ArrowLeft','a','A'].includes(e.key))act('left');if(['ArrowRight','d','D'].includes(e.key))act('right');if([' ','ArrowUp','w','W'].includes(e.key)){e.preventDefault();act('jump');}if(['ArrowDown','s','S'].includes(e.key))act('slide');};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);});
  return <div className="game-wrap"><div className="game-hud"><span>⭐ {score.toString().padStart(5,'0')}</span><span>🪙 {collected}</span><button className="icon-btn" onClick={()=>setRunning(v=>!v)} aria-label="Pausar"><Pause size={18}/></button></div><canvas ref={canvasRef} onTouchStart={e=>{touch.current={x:e.touches[0].clientX,y:e.touches[0].clientY};}} onTouchEnd={e=>{if(!touch.current)return;const dx=e.changedTouches[0].clientX-touch.current.x,dy=e.changedTouches[0].clientY-touch.current.y;if(Math.abs(dx)>Math.abs(dy))act(dx>0?'right':'left');else act(dy<0?'jump':'slide');touch.current=null;}}/><div className="game-controls"><button onClick={()=>act('left')}>←</button><button onClick={()=>act('jump')}>PULAR</button><button onClick={()=>act('slide')}>DESLIZAR</button><button onClick={()=>act('right')}>→</button></div>{!running&&<div className="game-overlay"><div className="result-card"><h2>{state.current.over?'Fim de corrida':'Pausado'}</h2><p>Pontuação: <b>{score}</b> · Moedas: <b>{collected}</b></p><button className="primary" onClick={()=>{state.current={lane:1,jump:0,slide:false,items:[],tick:0,score:0,coins:0,over:false};setLane(1);setJump(0);setSlide(false);setCollected(0);setScore(0);setRunning(true);}}> <RotateCcw size={17}/> Jogar novamente</button></div></div>}</div>;
}

export default function App(){
  const [page,setPage]=useState<'home'|'play'|'customize'>('home');
  const [mode,setMode]=useState<Mode>('classic');
  const [mapId,setMapId]=useState<MapId>('neon');
  const [total,setTotal]=useState(()=>Number(localStorage.getItem('sh-coins')||0));
  const [best,setBest]=useState(()=>Number(localStorage.getItem('sh-best')||0));
  const [texture,setTexture]=useState(()=>localStorage.getItem('sh-texture')||'');
  const [coinSkin,setCoinSkin]=useState(()=>localStorage.getItem('sh-coin')||'');
  const [lastRun,setLastRun]=useState(0);
  const map=maps.find(m=>m.id===mapId)!;
  const finish=(score:number,coins:number)=>{setTotal(v=>{const n=v+coins;localStorage.setItem('sh-coins',String(n));return n;});setBest(v=>{const n=Math.max(v,score);localStorage.setItem('sh-best',String(n));return n;});setLastRun(score);};
  const saveImage=(key:'texture'|'coin',value:string)=>{try{localStorage.setItem(key==='texture'?'sh-texture':'sh-coin',value);key==='texture'?setTexture(value):setCoinSkin(value);}catch{alert('O armazenamento do navegador está cheio. Remova uma imagem antiga e tente novamente.');}};
  return <div className="app-shell"><header className="topbar"><button className="brand" onClick={()=>setPage('home')}><span className="brand-mark"><TrainFront/></span><span>SUBWAY <b>HUB</b><small>RUN YOUR WAY</small></span></button><div className="top-stats"><span><Coins size={16}/> {total}</span><span><Trophy size={16}/> {best}</span></div></header>
    <main>{page==='home'&&<><section className="hero"><div className="hero-copy"><span className="eyebrow"><Zap size={14}/> SEU PRÓXIMO CORRE COMEÇA AQUI</span><h1>Corra no seu<br/><em>próprio mundo.</em></h1><p>Um endless runner original. Escolha o cenário, desvie dos obstáculos e monte seu estilo.</p><button className="primary big" onClick={()=>{setMode('classic');setPage('play');}}><Play size={19} fill="currentColor"/> COMEÇAR A CORRER</button><div className="hero-meta"><span><Smartphone size={15}/> Mobile</span><span><Monitor size={15}/> PC</span><span>✦ Grátis</span></div></div><div className="hero-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="runner-emoji">🏃</div><div className="floating-coin">🪙</div><div className="float-label">RUN<br/>FASTER</div></div></section>
      <section className="section"><div className="section-head"><div><span className="eyebrow">ESCOLHA SEU CAMINHO</span><h2>Modos de jogo</h2></div></div><div className="mode-grid"><button className="mode-card" onClick={()=>{setMode('classic');setPage('play');}}><span className="mode-icon purple"><Zap/></span><h3>Corrida clássica</h3><p>Corra o máximo que conseguir e bata seu recorde.</p><b>JOGAR <span>↗</span></b></button><button className="mode-card" onClick={()=>{setMode('training');setPage('play');}}><span className="mode-icon green"><Dumbbell/></span><h3>Treinamento</h3><p>Pratique movimentos e aprenda o ritmo da pista.</p><b>TREINAR <span>↗</span></b></button><button className="mode-card" onClick={()=>setPage('customize')}><span className="mode-icon orange"><Palette/></span><h3>Personalização</h3><p>Adicione suas próprias imagens e escolha um mapa.</p><b>PERSONALIZAR <span>↗</span></b></button></div></section>
      <section className="section map-section"><div className="section-head"><div><span className="eyebrow">NOVOS HORIZONTES</span><h2>Explore os mapas</h2></div><Map size={22}/></div><div className="map-grid">{maps.map(m=><button key={m.id} className={'map-card '+(mapId===m.id?'selected':'')} style={{background:m.sky}} onClick={()=>setMapId(m.id)}><span className="map-preview" style={{background:m.ground}}/><b>{m.name}</b><small>{m.detail}</small>{mapId===m.id&&<span className="map-check">✓ SELECIONADO</span>}</button>)}</div></section></>}
    {page==='play'&&<section className="play-page"><div className="play-heading"><button className="back-btn" onClick={()=>setPage('home')}>← Voltar</button><div><span className="eyebrow">{mode==='training'?'MODO TREINAMENTO':'CORRIDA CLÁSSICA'}</span><h2>{map.name}</h2></div><span className="record-pill">🏆 {best}</span></div><Runner key={map.id+mode} map={map} mode={mode} onEnd={finish} onCoins={n=>setLastRun(n)}/><p className="tip">Controles: ← → para mudar de faixa · Espaço/↑ para pular · ↓ para deslizar. No celular, deslize na tela ou use os botões.</p></section>}
    {page==='customize'&&<section className="custom-page"><button className="back-btn" onClick={()=>setPage('home')}>← Voltar</button><span className="eyebrow">OFICINA DO CORREDOR</span><h1>Seu jogo,<br/><em>suas regras.</em></h1><div className="custom-grid"><div className="custom-panel"><h3><Map/> Cenário</h3><p>Escolha o ambiente da sua próxima corrida.</p><div className="map-grid">{maps.map(m=><button key={m.id} className={'map-card '+(mapId===m.id?'selected':'')} style={{background:m.sky}} onClick={()=>setMapId(m.id)}><b>{m.name}</b><small>{m.detail}</small></button>)}</div></div><div className="custom-panel"><h3><Upload/> Suas texturas</h3><p>Envie imagens próprias para testar personalizações locais. Arquivos de até 1 MB.</p><label className="upload-zone">{texture?<img src={texture} alt="Textura enviada"/>:<span className="upload-placeholder"><Upload size={24}/> Textura do personagem</span>}<input type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f)readImage(f,v=>saveImage('texture',v));}}/></label><label className="upload-zone coin-upload">{coinSkin?<img src={coinSkin} alt="Moeda personalizada"/>:<span className="upload-placeholder">🪙 Ícone da moeda</span>}<input type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f)readImage(f,v=>saveImage('coin',v));}}/></label><small className="muted">As imagens ficam salvas somente neste navegador. Nesta primeira versão, elas ainda não alteram os modelos dentro da corrida.</small></div></div><div className="notice"><Lock size={17}/><span><b>Mods seguros:</b> por enquanto aceitamos imagens, não scripts ou arquivos executáveis. Isso protege o navegador e os jogadores.</span></div></section>}
    </main><footer><span>SUBWAY HUB <b>ALPHA 0.1</b></span><span>Feito para correr em qualquer tela.</span><span className="footer-muted">Projeto independente, com arte original.</span></footer></div>;
}