(function(){
"use strict";
/* =====================================================================
   Happy Ducklings Academy — Smart Classroom Board  (v2)
   Sections: helpers · data · settings · audio · characters · navigation ·
   activity · learn · emotions · rules · pickers · spotlight · timers ·
   teacher panel · nap · welcome · clock loop
   ===================================================================== */
var $=function(id){return document.getElementById(id)};
function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function P(k){return "assets/img/"+k+".webp"}
function pad(n){return String(n).padStart(2,"0")}

/* ---------- icons (inline SVG: no emoji, TVs often lack the glyphs) ---------- */
var IC={
 music:'<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
 mute:'<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/><path d="M3 3l18 18"/>',
 vd:'<path d="M4 9h3l5-4v14l-5-4H4z"/><path d="M16 12h5"/>',
 vu:'<path d="M4 9h3l5-4v14l-5-4H4z"/><path d="M16 12h5M18.5 9.5v5"/>',
 moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
 home:'<path d="M4 11l8-7 8 7M6 10v9h12v-9M10 19v-5h4v5"/>',
 gear:'<circle cx="12" cy="12" r="3.4"/><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M5.5 18.5l2.1-2.1M16.4 7.6l2.1-2.1"/>',
 grid:'<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
 check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
 left:'<path d="M15 5l-7 7 7 7"/>', right:'<path d="M9 5l7 7-7 7"/>',
 timer:'<circle cx="12" cy="13.5" r="7"/><path d="M12 13.5V9.5M9.5 3h5M12 3v3.5"/>',
 box:'<path d="M4 9.5h16v9.5H4zM4 9.5l2-4.5h12l2 4.5M9.5 13.5h5"/>',
 drop:'<path d="M12 3c3.5 4.5 6 7.3 6 10.5a6 6 0 0 1-12 0C6 10.3 8.5 7.5 12 3z"/>',
 pin:'<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
 reset:'<path d="M5 12a7 7 0 1 0 2.2-5.1M5 4.5V8h3.5"/>',
 pause:'<path d="M8 5v14M16 5v14"/>', play:'<path d="M8 5l11 7-11 7z"/>',
 close:'<path d="M6 6l12 12M18 6L6 18"/>',
 full:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
 plus:'<path d="M12 5v14M5 12h14"/>', minus:'<path d="M5 12h14"/>',
 auto:'<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>'
};
function ic(n,c){return '<svg class="ic'+(c?" "+c:"")+'" viewBox="0 0 24 24" aria-hidden="true">'+IC[n]+'</svg>'}
function lbl(icon,en,es){return (icon?ic(icon):"")+'<span class="lb"><b>'+en+'</b><i>'+es+'</i></span>'}

/* ---------- data ---------- */
var ACTS=[
 {id:"arrival",en:"Arrival & Greeting",es:"Llegada y saludo",m:["Welcome!","¡Bienvenidos!"],anim:"wave"},
 {id:"circle",en:"Circle Time",es:"Asamblea",m:["Let's share together","Compartimos juntos"],anim:"sway"},
 {id:"learning",en:"Learning Center",es:"Aprendizaje",m:["Let's learn together","Aprendamos juntos"],anim:"hop",prop:"book"},
 {id:"explore",en:"Explore & Build",es:"Exploración y construcción",m:["Build something great","Construye algo genial"],anim:"hop"},
 {id:"sensory",en:"Sensory Play",es:"Juego sensorial",m:["Touch and feel","Toca y siente"],anim:"sway"},
 {id:"art",en:"Art & Craft",es:"Arte y pintura",m:["Be creative","Usa tu imaginación"],anim:"sway"},
 {id:"music",en:"Music & Sound",es:"Música y sonidos",m:["Listen and move","Escucha y muévete"],anim:"dance",prop:"notes"},
 {id:"lunch",en:"Lunch Time",es:"Hora del almuerzo",m:["Yum, yum!","¡Qué rico!"],anim:"hop"},
 {id:"story",en:"Story Time",es:"Hora del cuento",m:["Open ears, open hearts","Oídos y corazones abiertos"],anim:"sway",prop:"book"},
 {id:"clean",en:"Clean-up Time",es:"Recoger y ordenar",m:["Every toy has a home","Cada juguete tiene su lugar"],anim:"dance"},
 {id:"nap",en:"Nap Time",es:"Hora de la siesta",m:["Sweet dreams","Dulces sueños"],anim:"breathe"},
 {id:"goodbye",en:"Goodbye",es:"Despedida",m:["See you tomorrow","Hasta mañana"],anim:"wave"}];
var ACT={};ACTS.forEach(function(a){ACT[a.id]=a});
var T0=["08:00","08:30","09:00","09:45","10:30","11:00","11:30","12:00","12:45","13:15","13:30","15:00","15:30"];
var ZONES=[["pretend","Pretend Play Area","Zona de juego simbólico"],["lyrics","Music and Lyrics","Música y letras"],["stimulation","Early Stimulation Area","Zona de estimulación temprana"],["feeding","Feeding Area","Zona de alimentación"],["circle","Circle Time","Asamblea"],["learning","Learning Center","Aprendizaje"],["explore","Explore & Build","Exploración y construcción"],["sensory","Sensory Play","Juego sensorial"],["art","Art & Craft","Arte y pintura"],["count","Sort & Count","Agrupar y contar"],["bounce","Roll & Bounce","Pelotas y más"],["music","Music & Sound","Música y sonidos"]];
var CAP={s_arrival:["Arrival & Greeting","Llegada y saludo"],s_story:["Story Time","Hora del cuento"],s_nap:["Nap Time","Hora de la siesta"],s_clean:["Clean-up Time","Recoger y ordenar"],s_goodbye:["Goodbye","Despedida"],
 p_routine:["Daily Routine","Rutina diaria"],p_activities:["Activities","Actividades"],p_friends:["Friends at School","Amigos en la escuela"],p_learnplay:["Learn & Play","Aprender y jugar"],p_backtoschool:["Back to School","Regreso a la escuela"]};
ZONES.forEach(function(z){CAP["z_"+z[0]]=[z[1],z[2]]});
var RULES=[["walk","Walk slowly","Caminamos despacio"],["hands","Quiet hands","Manos quietas"],["share","We share","Compartimos"],["voice","Soft voice","Voz suave"],["listen","We listen","Escuchamos"],["wash","Wash our hands","Lavamos las manos"]];
RULES.forEach(function(r){CAP["r_"+r[0]]=[r[1],r[2]]});
var POOL={arrival:["s_arrival","p_friends","p_backtoschool"],circle:["z_circle","r_listen","p_friends","p_routine"],learning:["z_learning","z_count","p_learnplay"],explore:["z_explore","z_bounce","z_pretend","r_share"],
 sensory:["z_sensory","z_stimulation","p_activities"],art:["z_art","p_learnplay","p_activities"],music:["z_music","z_lyrics","p_friends"],lunch:["z_feeding","r_wash","p_activities","p_routine"],
 story:["s_story","r_listen","p_backtoschool","p_learnplay"],clean:["s_clean","r_share","p_routine","p_activities"],nap:["s_nap","p_routine"],goodbye:["s_goodbye","p_backtoschool","p_friends"],x:["s_goodbye","p_backtoschool","p_friends"]};
var THUMB={arrival:"s_arrival",circle:"z_circle",learning:"z_learning",explore:"z_explore",sensory:"z_sensory",art:"z_art",music:"z_music",lunch:"z_feeding",story:"s_story",clean:"s_clean",nap:"s_nap",goodbye:"s_goodbye"};
var GUIDE={arrival:[["Say hello!","¡Decimos hola!"],["Put away our backpacks","Guardamos las mochilas"],["Find a friend to play","Buscamos un amigo para jugar"]],
 circle:[["Sit in the circle","Nos sentamos en el círculo"],["Sing the hello song","Cantamos el saludo"],["Share how we feel","Compartimos cómo nos sentimos"]],
 learning:[["Look at the letter","Miramos la letra"],["Say the word together","Decimos la palabra juntos"],["Find it in the room","La buscamos en el salón"]],
 explore:[["Pick your blocks","Elegimos las piezas"],["Build together","Construimos juntos"],["Show your friends","Mostramos a los amigos"]],
 sensory:[["Touch gently","Tocamos con suavidad"],["What do you feel?","¿Qué sentimos?"],["Share the materials","Compartimos los materiales"]],
 art:[["Choose your colors","Elegimos colores"],["Create something fun","Creamos algo divertido"],["Show your art","Mostramos nuestro arte"]],
 music:[["Listen to the sound","Escuchamos el sonido"],["Move with the beat","Nos movemos con el ritmo"],["Play softly","Tocamos suave"]],
 lunch:[["Wash our hands","Lavamos las manos"],["Sit and eat slowly","Nos sentamos y comemos despacio"],["Say thank you","Decimos gracias"]],
 story:[["Sit and get comfy","Nos sentamos cómodos"],["Listen to the story","Escuchamos el cuento"],["Tell what you liked","Contamos qué nos gustó"]],
 clean:[["Pick up one toy","Recogemos un juguete"],["Put it in its box","Lo guardamos en su caja"],["Help a friend","Ayudamos a un amigo"]],
 nap:[["Lie down quietly","Nos acostamos en silencio"],["Close our eyes","Cerramos los ojos"],["Breathe slowly","Respiramos despacio"]],
 goodbye:[["Get your backpack","Tomamos la mochila"],["Say goodbye","Decimos adiós"],["See you tomorrow!","¡Hasta mañana!"]]};
var TOOL={clean:["clean","timer","Timer","Tiempo"],lunch:["wash","drop","Wash hands","Lavar manos"],arrival:["wash","drop","Wash hands","Lavar manos"]};
var EMO=[["happy","Happy","Feliz"],["sad","Sad","Triste"],["angry","Angry","Enojado"],["scared","Scared","Asustado"],["surprised","Surprised","Sorprendido"],["calm","Calm","Tranquilo"]];
var MSG=[["You are amazing!","¡Eres increíble!"],["Great job!","¡Buen trabajo!"],["Let's learn together!","¡Aprendamos juntos!"],["Be kind!","¡Sé amable!"],["You can do it!","¡Tú puedes!"],["We are friends!","¡Somos amigos!"],["Try again!","¡Inténtalo otra vez!"]];
var WASH=[["Wet","Mojar"],["Soap","Jabón"],["Scrub","Frotar"],["Rinse","Enjuagar"],["Dry","Secar"]];
var VOW=[["A","a","co","ye2",[["apple","Apple","Manzana"],["ant","Ant","Hormiga"]]],["E","e","sk2","mi2",[["elephant","Elephant","Elefante"],["egg","Egg","Huevo"]]],["I","i","pu2","or",[["iguana","Iguana","Iguana"],["island","Island","Isla"]]],["O","o","or","co",[["octopus","Octopus","Pulpo"],["orange","Orange","Naranja"]]],["U","u","gr2","sk2",[["umbrella","Umbrella","Paraguas"],["unicorn","Unicorn","Unicornio"]]]];
var NUM=[["One","Uno"],["Two","Dos"],["Three","Tres"],["Four","Cuatro"],["Five","Cinco"],["Six","Seis"],["Seven","Siete"],["Eight","Ocho"],["Nine","Nueve"],["Ten","Diez"]];
var COL=[["Red","Rojo","#E8615A"],["Orange","Naranja","#F59A4A"],["Yellow","Amarillo","#F7D056"],["Green","Verde","#7FBF6A"],["Blue","Azul","#6FAEE0"],["Purple","Morado","#A98BD4"],["Pink","Rosa","#F4A3B8"],["Brown","Marrón","#9A6A45"]];
var SHP=[["Circle","Círculo","#F28B80",'<circle cx="50" cy="50" r="40"/>'],["Square","Cuadrado","#6FAEE0",'<rect x="12" y="12" width="76" height="76" rx="8"/>'],["Triangle","Triángulo","#7FBF6A",'<path d="M50 10L92 86H8z"/>'],["Rectangle","Rectángulo","#F5AD65",'<rect x="6" y="24" width="88" height="52" rx="8"/>'],["Star","Estrella","#F7D056",'<path d="M50 6l12.6 26.4 29 3.8-21.2 20 5.4 28.8L50 71 24.2 85l5.4-28.8-21.2-20 29-3.8z"/>'],["Heart","Corazón","#F4A3B8",'<path d="M50 88C20 66 8 50 8 33 8 19 19 10 30 10c9 0 16 5 20 13 4-8 11-13 20-13 11 0 22 9 22 23 0 17-12 33-42 55z"/>']];
var DECKS=[["vowels","Aa","Vowels","Vocales"],["numbers","123","Numbers","Números"],["colors","","Colors","Colores"],["shapes","","Shapes","Figuras"]];
var DN=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],DE=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"],
    MN=["January","February","March","April","May","June","July","August","September","October","November","December"],ME=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

/* ---------- settings (saved on this device) ---------- */
var KEY="hda2";
function DEF(){return {v:2,auto:true,manual:"arrival",sched:ACTS.map(function(a,i){return {id:a.id,s:T0[i],e:T0[i+1],on:true}}),days:[1,2,3,4,5],
 carSec:120,galSec:10,ruleSec:20,wash:20,cleanMin:5,freeMin:5,vol:50,sfx:70,music:true,voice:true,timerMusic:true,napSound:"lullaby",
 dim:0,warnMin:5,h24:false,intro:true,decks:{vowels:true,numbers:true,colors:true,shapes:true}}}
var TRX=/^([01]\d|2[0-3]):[0-5]\d$/;
function sanitize(o){var d=DEF(),k;o=o&&typeof o==="object"?o:{};
 for(k in d){if(typeof d[k]!=="object"&&typeof o[k]===typeof d[k])d[k]=o[k]}
 if(!ACT[d.manual])d.manual="arrival";
 d.carSec=clamp(Math.round(d.carSec)||120,10,900);d.galSec=clamp(Math.round(d.galSec)||10,3,300);d.ruleSec=clamp(Math.round(d.ruleSec)||20,5,300);
 d.wash=clamp(Math.round(d.wash)||20,5,180);d.cleanMin=clamp(Math.round(d.cleanMin)||5,1,30);d.freeMin=clamp(Math.round(d.freeMin)||5,1,60);
 d.vol=clamp(Math.round(d.vol),0,100)||0;d.sfx=clamp(Math.round(d.sfx),0,100)||0;d.dim=clamp(Math.round(d.dim),0,70)||0;
 if([0,2,5,10].indexOf(d.warnMin)<0)d.warnMin=5;if(["lullaby","quiet","off"].indexOf(d.napSound)<0)d.napSound="lullaby";
 if(Array.isArray(o.sched))d.sched.forEach(function(x){var y=o.sched.filter(function(z){return z&&z.id===x.id})[0];if(y){if(TRX.test(y.s))x.s=y.s;if(TRX.test(y.e))x.e=y.e;x.on=y.on!==false}});
 if(Array.isArray(o.days))d.days=o.days.filter(function(n,i,a){return n===(n|0)&&n>=0&&n<=6&&a.indexOf(n)===i});
 if(o.decks&&typeof o.decks==="object")for(k in d.decks)if(typeof o.decks[k]==="boolean")d.decks[k]=o.decks[k];
 if(!DECKS.some(function(x){return d.decks[x[0]]}))d.decks.vowels=true;
 return d}
var S;(function(){var raw=null;try{raw=localStorage.getItem(KEY)||localStorage.getItem("hda")}catch(e){}var o={};try{o=JSON.parse(raw||"{}")}catch(e){}S=sanitize(o)})();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function mins(t){var p=t.split(":");return +p[0]*60+ +p[1]}
function hhmm(n){n=((n%1440)+1440)%1440;return pad(Math.floor(n/60))+":"+pad(n%60)}
function fmtT(t){var p=t.split(":"),h=+p[0];if(S.h24)return h+":"+p[1];return (h%12||12)+":"+p[1]+(h<12?" AM":" PM")}

/* ---------- fit the 1920x1080 stage to any screen (+ tiny anti burn-in drift) ---------- */
var jx=0,jy=0;
function fit(){var f=$("fit"),W=f.clientWidth||innerWidth,H=f.clientHeight||innerHeight,st=$("stage").style,k;
 if(H>W*1.15&&W<900){k=Math.min(H/1920,W/1080)||1;   /* phone held upright: turn the board sideways so it fills the screen */
  st.transform="translate("+((W+1080*k)/2)+"px,"+((H-1920*k)/2)+"px) rotate(90deg) scale("+k+")";return}
 k=Math.min(W/1920,H/1080)||1;
 st.transform="translate("+((W-1920*k)/2+jx*k)+"px,"+((H-1080*k)/2+jy*k)+"px) scale("+k+")"}
addEventListener("resize",fit);addEventListener("orientationchange",function(){setTimeout(fit,300)});fit();

/* =====================================================================
   AUDIO: background music mixer · sound effects · optional voice
   ===================================================================== */
var started=false,welcome=true,isNap=false,tm=null;
var AU={},duck=1,duckT=0,volOK=true,actx=null,bufs={},SFX=window.HDA_SFX||{};
function track(name,srcs){var a=new Audio();a.preload="none";a.loop=true;
 srcs.forEach(function(s){var so=document.createElement("source");so.src=s;so.type=/m4a$/.test(s)?"audio/mp4":"audio/mpeg";a.appendChild(so)});
 AU[name]={a:a,g:0,wait:0}}
track("song",["assets/audio/song.m4a","assets/audio/song.mp3"]);track("lullaby",["assets/audio/lullaby.mp3"]);
track("cleanup",["assets/audio/cleanup.mp3"]);track("wash",["assets/audio/wash.mp3"]);
function desired(){
 if(!started)return null;
 if(tm){if(tm.end)return null;if(S.timerMusic&&(tm.kind==="clean"||tm.kind==="wash"))return tm.run?{n:tm.kind==="clean"?"cleanup":"wash",g:1}:null}
 if(!S.music)return null;
 if(isNap){if(S.napSound==="lullaby")return {n:"lullaby",g:.6};if(S.napSound==="quiet")return {n:"song",g:Math.min(1,8/Math.max(S.vol,1))};return null}
 return {n:"song",g:1}}
function loopFade(a){var d=a.duration,c=a.currentTime;if(!d||!isFinite(d))return 1;return clamp(Math.min(c/1.5+.05,(d-c)/3),0,1)}
function mixTick(){var w=desired(),now=Date.now(),n;
 for(n in AU){var t=AU[n],tg=w&&w.n===n?w.g:0;
  t.g+=(tg-t.g)*.14;if(Math.abs(tg-t.g)<.006)t.g=tg;
  var v=clamp(t.g*(S.vol/100)*duck*(n==="song"?loopFade(t.a):1),0,1);
  if(t.gn)t.gn.gain.value=v;else{try{t.a.volume=v}catch(e){}}
  if(tg>0&&t.a.paused&&now>t.wait){t.wait=now+2500;(function(t){try{var p=t.a.play();if(p&&p.then)p.then(function(){t.wait=0},function(){})}catch(e){}})(t)}
  if(tg===0&&t.g===0&&!t.a.paused){try{t.a.pause()}catch(e){}}}}
setInterval(mixTick,80);
function b64ab(s){var b=atob(s),n=b.length,u=new Uint8Array(n);for(var i=0;i<n;i++)u[i]=b.charCodeAt(i);return u.buffer}
function initAudio(){
 try{var t=new Audio();t.volume=.5;volOK=t.volume===.5}catch(e){}
 var AC=window.AudioContext||window.webkitAudioContext;
 if(!actx&&AC){try{actx=new AC();
   Object.keys(SFX).forEach(function(n){try{actx.decodeAudioData(b64ab(SFX[n]),function(b){bufs[n]=b},function(){})}catch(e){}});
   if(!volOK)for(var n in AU){try{var src=actx.createMediaElementSource(AU[n].a),g=actx.createGain();g.gain.value=0;src.connect(g);g.connect(actx.destination);AU[n].gn=g}catch(e){}}
  }catch(e){actx=null}}
 if(actx&&actx.state==="suspended"){try{actx.resume()}catch(e){}}}
var okPending=false,lastNav=0;
function sfx(n,v){okPending=false;
 if(!started||!SFX[n])return;var vol=(S.sfx/100)*(v==null?1:v)*(isNap?.35:1);if(vol<=.005)return;
 try{if(actx&&bufs[n]){if(actx.state==="suspended")actx.resume();var s=actx.createBufferSource(),g=actx.createGain();s.buffer=bufs[n];g.gain.value=vol;s.connect(g);g.connect(actx.destination);s.start(0)}
  else{var a=new Audio("data:audio/mpeg;base64,"+SFX[n]);a.volume=clamp(vol,0,1);var p=a.play();if(p&&p.catch)p.catch(function(){})}}catch(e){}}
/* voice: reads the English word, then the Spanish one, only when someone presses OK on something */
var SY=window.speechSynthesis,voices=[];
function loadV(){try{voices=SY.getVoices()||[]}catch(e){voices=[]}}
if(SY){loadV();try{SY.addEventListener("voiceschanged",loadV)}catch(e){}}
function pickV(pref){for(var i=0;i<pref.length;i++){var m=voices.filter(function(v){return v.lang&&v.lang.replace("_","-").toLowerCase().indexOf(pref[i])===0});
  if(m.length)return m.filter(function(x){return /google|samantha|paulina|natural|enhanced/i.test(x.name)})[0]||m[0]}return null}
function say(en,es){if(!S.voice||!SY||!started||isNap)return;
 try{SY.cancel();var mk=function(t,pref,dl){var u=new SpeechSynthesisUtterance(t),v=pickV(pref);if(v){u.voice=v;u.lang=v.lang}else u.lang=dl;u.rate=.86;u.pitch=1.1;return u};
  var a=mk(en,["en-us","en"],"en-US"),b=es?mk(es,["es-us","es-mx","es-419","es"],"es-US"):null,last=b||a;
  a.onstart=function(){duck=.3};last.onend=last.onerror=function(){duck=1};
  SY.speak(a);if(b)SY.speak(b);clearTimeout(duckT);duckT=setTimeout(function(){duck=1},9000)}catch(e){duck=1}}
function hush(){try{if(SY)SY.cancel()}catch(e){}duck=1}

/* =====================================================================
   CHARACTERS: duck + bear, drawn in SVG with swappable faces
   ===================================================================== */
function charSVG(t){
 var d=t==="duck",B="#5C3A21",st='stroke="'+B+'" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"',s4='stroke="'+B+'" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"',
  ln='fill="none" stroke="'+B+'" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"',
  body=d?"#FCE389":"#EBBE93",belly=d?"#FFF7D1":"#FFF1DD",limb=d?"#F7D056":"#E0A878",o="";
 o+='<svg class="chs" viewBox="0 -18 200 258" aria-hidden="true"><ellipse class="shd" cx="100" cy="229" rx="62" ry="8"/>';
 o+=d?'<ellipse cx="76" cy="219" rx="19" ry="9" fill="#F5AD65" '+st+'/><ellipse cx="124" cy="219" rx="19" ry="9" fill="#F5AD65" '+st+'/>'
     :'<ellipse cx="70" cy="216" rx="22" ry="12" fill="'+limb+'" '+st+'/><ellipse cx="130" cy="216" rx="22" ry="12" fill="'+limb+'" '+st+'/>';
 o+='<ellipse cx="100" cy="164" rx="58" ry="52" fill="'+body+'" '+st+'/><ellipse cx="100" cy="176" rx="34" ry="30" fill="'+belly+'"/>';
 o+='<g class="armL" style="transform-origin:52px 138px"><ellipse cx="44" cy="162" rx="16" ry="30" fill="'+limb+'" '+st+'/></g>';
 o+='<g class="armR" style="transform-origin:148px 138px"><ellipse cx="156" cy="162" rx="16" ry="30" fill="'+limb+'" '+st+'/></g>';
 o+='<g class="x-book"><path d="M100 178L62 168v40l38 10z" fill="#fff" '+s4+'/><path d="M100 178l38-10v40l-38 10z" fill="#fff" '+s4+'/><path d="M72 182l18 5M72 193l18 5M110 187l18-5M110 198l18-5" '+ln+' stroke-width="3" opacity=".45"/><path d="M62 208l38 10 38-10v7l-38 10-38-10z" fill="#8ED4BD" '+s4+'/></g>';
 o+='<g class="hd">';
 o+=d?'<path d="M100 32q-17-15-5-25 9 7 5 25zM102 32q15-10 9-21-9 4-9 21z" fill="'+body+'" '+s4+'/>'
     :'<circle cx="56" cy="42" r="21" fill="'+body+'" '+st+'/><circle cx="144" cy="42" r="21" fill="'+body+'" '+st+'/><circle cx="56" cy="44" r="9.5" fill="#F7C6C7"/><circle cx="144" cy="44" r="9.5" fill="#F7C6C7"/>';
 o+='<circle cx="100" cy="84" r="55" fill="'+body+'" '+st+'/>';
 o+='<ellipse class="chk" cx="60" cy="100" rx="10.5" ry="7.5" fill="#F7B9BB"/><ellipse class="chk" cx="140" cy="100" rx="10.5" ry="7.5" fill="#F7B9BB"/>';
 o+='<g class="eyes" style="transform-origin:100px 80px"><g class="e-open"><circle cx="79" cy="80" r="7.5" fill="'+B+'"/><circle cx="121" cy="80" r="7.5" fill="'+B+'"/><circle cx="81.6" cy="77.2" r="2.4" fill="#fff"/><circle cx="123.6" cy="77.2" r="2.4" fill="#fff"/></g>';
 o+='<g class="e-wide"><circle cx="79" cy="80" r="11.5" fill="#fff" '+s4+'/><circle cx="121" cy="80" r="11.5" fill="#fff" '+s4+'/><circle cx="79" cy="81" r="4.6" fill="'+B+'"/><circle cx="121" cy="81" r="4.6" fill="'+B+'"/></g></g>';
 o+='<path class="e-happy" d="M69 83q10-13 20 0M111 83q10-13 20 0" '+ln+'/><path class="e-calm" d="M69 78q10 10 20 0M111 78q10 10 20 0" '+ln+'/>';
 o+='<path class="b-angry" d="M66 60l24 9M134 60l-24 9" '+ln+'/><path class="b-sad" d="M66 68l22-8M134 68l-22-8" '+ln+'/>';
 if(d){o+='<g class="m-smile m-shut"><ellipse cx="100" cy="103" rx="21" ry="11.5" fill="#F5AD65" '+s4+'/><path d="M85 104q15 6 30 0" fill="none" stroke="'+B+'" stroke-width="3" stroke-linecap="round" opacity=".5"/></g>';
  o+='<g class="m-frown"><ellipse cx="100" cy="105" rx="19" ry="10" fill="#F5AD65" '+s4+'/><path d="M86 108q14-6 28 0" fill="none" stroke="'+B+'" stroke-width="3" stroke-linecap="round" opacity=".6"/></g>';
  o+='<g class="m-open m-o"><path d="M83 104q17 26 34 0z" fill="#E38F4D" '+s4+'/><ellipse cx="100" cy="111" rx="7" ry="4" fill="#F28B80"/><ellipse cx="100" cy="99" rx="21" ry="9.5" fill="#F5AD65" '+s4+'/></g>'}
 else{o+='<ellipse cx="100" cy="105" rx="25" ry="19" fill="'+belly+'" '+s4+'/><ellipse cx="100" cy="96" rx="9" ry="6.2" fill="'+B+'"/>';
  o+='<path class="m-smile" d="M89 108q11 9 22 0" '+ln+' stroke-width="4"/><path class="m-open" d="M88 107q12 17 24 0z" fill="#C0554A" '+s4+'/><path class="m-frown" d="M89 115q11-8 22 0" '+ln+' stroke-width="4"/><ellipse class="m-o" cx="100" cy="113" rx="6" ry="7" fill="'+B+'"/>'}
 o+='<path class="x-tear" d="M132 92c6 9 7 14 0 17-7-3-6-8 0-17z" fill="#8EC5F0" stroke="'+B+'" stroke-width="3" stroke-linejoin="round"/>';
 o+='<path class="x-sweat" d="M150 40c6 9 7 14 0 17-7-3-6-8 0-17z" fill="#8EC5F0" stroke="'+B+'" stroke-width="3" stroke-linejoin="round"/>';
 o+='<g class="x-cap"><path d="M47 62Q52 14 100 14q48 0 53 48-53-18-106 0z" fill="#6FAEE0" '+st+'/><path d="M60 40q40-12 80 0" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/><circle cx="100" cy="10" r="11" fill="#fff" '+s4+'/></g>';
 o+='</g>';
 o+='<g class="x-steam"><g fill="#fff" '+s4+'><circle cx="26" cy="30" r="9"/><circle cx="38" cy="22" r="7"/><circle cx="174" cy="30" r="9"/><circle cx="162" cy="22" r="7"/></g></g>';
 o+='<path class="x-lines" d="M100-12v14M64-4l7 13M136-4l-7 13" '+ln+'/>';
 o+='<g class="x-zzz" font-family="Fredoka,sans-serif" font-weight="700" fill="#8EC5F0" stroke="'+B+'" stroke-width="1.4"><text x="150" y="40" font-size="30">Z</text><text x="170" y="16" font-size="23">Z</text><text x="186" y="-2" font-size="17">Z</text></g>';
 o+='<g class="x-notes"><g><path d="M170 44V20l14-4v22" fill="none" stroke="'+B+'" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="165" cy="45" rx="6.5" ry="5" fill="#F28B80" stroke="'+B+'" stroke-width="3"/><ellipse cx="179" cy="39" rx="6.5" ry="5" fill="#F28B80" stroke="'+B+'" stroke-width="3"/></g><g><path d="M30 40V16" fill="none" stroke="'+B+'" stroke-width="4" stroke-linecap="round"/><ellipse cx="25" cy="41" rx="6.5" ry="5" fill="#6FAEE0" stroke="'+B+'" stroke-width="3"/></g></g>';
 o+='<path class="x-heart" d="M172 34c0-7 9-7 9-1 0-6 9-6 9 1 0 7-9 11-9 14 0-3-9-7-9-14z" fill="#F28B80" stroke="'+B+'" stroke-width="3" stroke-linejoin="round"/>';
 return o+'</svg>'}
function mount(id,type){var e=$(id);e.dataset.base=e.className;e.dataset.t=type;e.innerHTML='<div class="chw">'+charSVG(type)+(e.tagName==="BUTTON"?'<div class="bub"></div>':"")+'</div>';return e}
function pose(e,mood,anim,prop){e.className=e.dataset.base+" mood-"+(mood||"neutral")+" a-"+(anim||"hop")+(prop?" prop-"+prop:"")}
var emoMood=null,emoT=0,MOODANIM={happy:"joy",sad:"droop",angry:"shake",scared:"tremble",calm:"breathe",surprised:"hop",sleep:"breathe"};
function chars(){var id=curId,a=ACT[id],mood=emoMood||(isNap?"sleep":"neutral"),anim=emoMood?MOODANIM[emoMood]:isNap?"breathe":a?a.anim:"hop",prop=emoMood||isNap||!a?"":a.prop;
 pose($("c1"),mood,anim,prop==="book"?"":prop);pose($("c2"),mood,anim,prop)}
function setMood(m,ms){emoMood=m;clearTimeout(emoT);chars();if(m)emoT=setTimeout(function(){emoMood=null;chars()},ms||9000)}
function jump(e){e.classList.remove("jump");void e.offsetWidth;e.classList.add("jump");setTimeout(function(){e.classList.remove("jump")},750)}
function cheer(){setMood("happy",3500);jump($("c1"));jump($("c2"))}
var bubT={};
function poke(e){var m=MSG[Math.floor(Math.random()*MSG.length)],b=e.querySelector(".bub"),id=e.id;
 jump(e);sfx(e.dataset.t==="duck"?"quack":"bear");b.innerHTML=m[0]+"<i>"+m[1]+"</i>";b.classList.add("show");
 clearTimeout(bubT[id]);bubT[id]=setTimeout(function(){b.classList.remove("show")},3600);setTimeout(function(){say(m[0],m[1])},450)}

/* rainbow "sticker" lettering used for every big title */
function rainbow(e,text){var n=0,h="";text.split(" ").forEach(function(w){h+='<span class="w">';for(var i=0;i<w.length;i++){h+='<span class="l c'+(n%5)+'" style="animation-delay:'+(n*28)+'ms">'+w[i].replace("&","&amp;")+'</span>';n++}h+="</span> "});e.innerHTML=h;e.setAttribute("aria-label",text)}
function duckSVG(){return '<svg viewBox="0 0 74 64" aria-hidden="true"><g stroke="#5C3A21" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M10 34L3 28l9-1z" fill="#F7D056"/><ellipse cx="33" cy="43" rx="24" ry="16.5" fill="#F7D056"/><circle cx="48" cy="21" r="14.5" fill="#F7D056"/><path d="M61 17l10 4-10 5z" fill="#F5AD65"/><path d="M19 42q9 14 22 6" fill="none"/></g><circle cx="52" cy="17.5" r="2.6" fill="#5C3A21"/><ellipse cx="45" cy="27" rx="4.5" ry="3" fill="#F7B9BB"/></svg>'}
function brand(e){e.innerHTML=duckSVG()+"<div><b>Happy Ducklings</b><i>ACADEMY</i></div>"}

/* =====================================================================
   NAVIGATION: remote control / keyboard, overlays, focus memory
   ===================================================================== */
var stack=[];
function scope(){if(welcome)return $("wel");return stack.length?$(stack[stack.length-1].id):$("stage")}
function vis(e){return !!(e&&e.offsetParent!==null&&!e.disabled)}
function focusables(sc){var main=sc.id==="stage";return [].slice.call(sc.querySelectorAll("button")).filter(function(e){return vis(e)&&(!main||!e.closest(".ov"))})}
function focusOn(e){if(!e)return;try{e.focus({preventScroll:false})}catch(x){e.focus()}var sb=e.closest&&e.closest("#setb");if(sb){try{e.scrollIntoView({block:"nearest"})}catch(x){e.scrollIntoView(false)}}}
function openOv(id,f,quiet){if(stack.some(function(s){return s.id===id}))return;stack.push({id:id,prev:document.activeElement});$(id).classList.add("show");$("toast").classList.remove("show");if(!quiet)sfx("open",.7);focusOn(f&&vis(f)?f:focusables($(id))[0])}
function closeOv(id,quiet){var i=-1;stack.forEach(function(s,k){if(s.id===id)i=k});if(i<0)return;var s=stack.splice(i,1)[0];$(id).classList.remove("show");if(!quiet)sfx("close",.6);
 if(i===stack.length){var p=s.prev,sc=scope();if(p&&vis(p)&&sc.contains(p)&&(sc.id!=="stage"||!p.closest(".ov")))focusOn(p);else focusOn(sc.id==="stage"?$("gn"):focusables(sc)[0])}}
function nav(k){var L=focusables(scope()),a=document.activeElement;if(!L.length)return true;
 if(L.indexOf(a)<0){focusOn(scope().id==="stage"?$("gn"):L[0]);return true}
 var r=a.getBoundingClientRect(),best=null,bs=1e12,h=k==="Left"||k==="Right";
 L.forEach(function(e){if(e===a)return;var q=e.getBoundingClientRect(),major,gap,off;
  if(k==="Right"){if(q.left<r.left+r.width*.6)return;major=Math.max(0,q.left-r.right)}
  else if(k==="Left"){if(q.right>r.right-r.width*.6)return;major=Math.max(0,r.left-q.right)}
  else if(k==="Down"){if(q.top<r.top+r.height*.6)return;major=Math.max(0,q.top-r.bottom)}
  else{if(q.bottom>r.bottom-r.height*.6)return;major=Math.max(0,r.top-q.bottom)}
  if(h){gap=Math.max(0,q.top-r.bottom,r.top-q.bottom);off=Math.abs((q.top+q.bottom)-(r.top+r.bottom))/2}
  else{gap=Math.max(0,q.left-r.right,r.left-q.right);off=Math.abs((q.left+q.right)-(r.left+r.right))/2}
  if(h&&gap>0)return;var sc=major+(gap>0?gap*2.6+50:off*.25);if(sc<bs){bs=sc;best=e}});
 if(best){focusOn(best);var n=Date.now();if(n-lastNav>70)sfx("nav");lastNav=n}else sfx("bump",.5);return true}
function navSet(k){var a=document.activeElement,lines=[[].slice.call($("tabs").children)];
 [].forEach.call($("setb").querySelectorAll(".srow"),function(r){var b=[].slice.call(r.querySelectorAll("button"));if(b.length)lines.push(b)});
 lines.push([$("sx"),$("sz")]);var li=-1,bi=-1;lines.forEach(function(l,i){var j=l.indexOf(a);if(j>=0){li=i;bi=j}});
 if(li<0){focusOn(lines[0][0]);return}
 var t=null;if(k==="Left")t=lines[li][bi-1];else if(k==="Right")t=lines[li][bi+1];
 else{var nl=lines[li+(k==="Down"?1:-1)];if(nl){var r=a.getBoundingClientRect(),cx=(r.left+r.right)/2,bd=1e9;
   if(li===0||li===lines.length-1||nl===lines[0]||nl===lines[lines.length-1])t=nl===lines[0]?nl.filter(function(b){return b.className==="on"})[0]||nl[0]:nl[0];
   else nl.forEach(function(b){var q=b.getBoundingClientRect(),d=Math.abs((q.left+q.right)/2-cx);if(d<bd){bd=d;t=b}})}}
 if(t){focusOn(t);sfx("nav")}else sfx("bump",.5)}
function tabNav(back){var L=focusables(scope()),i=L.indexOf(document.activeElement);if(!L.length)return;focusOn(L[(i+(back?-1:1)+L.length)%L.length])}
var KC={37:"Left",38:"Up",39:"Right",40:"Down",13:"OK",27:"Back",8:"Back",10009:"Back",461:"Back",415:"Play",19:"Pause",10252:"PlayPause",179:"PlayPause",413:"Stop",403:"Red",404:"Green",405:"Yellow",406:"Blue",33:"PgUp",34:"PgDn",427:"PgUp",428:"PgDn"};
var KN={ArrowLeft:"Left",ArrowUp:"Up",ArrowRight:"Right",ArrowDown:"Down",Enter:"OK",Escape:"Back",Backspace:"Back",GoBack:"Back",BrowserBack:"Back",MediaPlayPause:"PlayPause",MediaPlay:"Play",MediaPause:"Pause",MediaStop:"Stop",PageUp:"PgUp",PageDown:"PgDn",ColorF0Red:"Red",ColorF1Green:"Green",ColorF2Yellow:"Yellow",ColorF3Blue:"Blue"};
function keyName(e){return KN[e.key]||KC[e.keyCode]||(e.key&&e.key.length===1?e.key.toLowerCase():"")}
var idleT=0;
function wake(){document.body.classList.remove("idle");clearTimeout(idleT);idleT=setTimeout(function(){document.body.classList.add("idle")},30000)}
function back(){if(!stack.length)return;var id=stack[stack.length-1].id;if(id==="tm")closeT();else if(id==="sp")closeSp();else if(id==="tr")closeTr();else closeOv(id)}
addEventListener("keydown",function(e){var k=keyName(e);wake();if(!k||e.ctrlKey||e.metaKey||e.altKey)return;
 if(welcome){if(k==="OK"||k===" "){e.preventDefault();start()}else if(k==="Left"||k==="Right"||k==="Up"||k==="Down"||k==="Back")e.preventDefault();return}
 if(k==="Left"||k==="Right"||k==="Up"||k==="Down"){e.preventDefault();
  if(stack.length&&stack[stack.length-1].id==="sp"&&(k==="Left"||k==="Right")){spGo(k==="Left"?-1:1);return}
  if(stack.length&&stack[stack.length-1].id==="set")navSet(k);else nav(k);return}
 if(e.key==="Tab"){e.preventDefault();tabNav(e.shiftKey);return}
 if(k==="Back"){e.preventDefault();back();return}
 if(k==="PlayPause"||k==="m"){e.preventDefault();toggleMusic();return}
 if(k==="Play"){if(!S.music)toggleMusic();return}
 if(k==="Pause"||k==="Stop"){if(S.music)toggleMusic();return}
 if(k==="+"||k==="="){vol(10);return}if(k==="-"){vol(-10);return}
 if(stack.length)return;
 if(k==="a"||k==="Red")openPick();else if(k==="z")openZones();else if(k==="t")startT("free");else if(k==="Green"){var tl=TOOL[curId];startT(tl?tl[0]:"free")}
 else if(k==="c")startT("clean");else if(k==="w")startT("wash");else if(k==="n"||k==="Yellow")toggleNap();else if(k==="s"||k==="Blue")openSet();
 else if(k==="h")goHome();else if(k==="f")fs();else if(k==="PgDn"||k==="]")gstep(1,true);else if(k==="PgUp"||k==="[")gstep(-1,true);
 else if(k==="1"||k==="2"||k==="3"){gs=+k-1;drawG(true)}});
try{if(window.tizen&&tizen.tvinputdevice)["ColorF0Red","ColorF1Green","ColorF2Yellow","ColorF3Blue","MediaPlayPause","MediaPlay","MediaPause","MediaStop"].forEach(function(k){try{tizen.tvinputdevice.registerKey(k)}catch(e){}})}catch(e){}
addEventListener("pointerdown",wake);addEventListener("mousemove",wake);
document.addEventListener("click",function(e){if(e.target.closest&&e.target.closest("button")){okPending=true;setTimeout(function(){if(okPending)sfx("ok",.8)},0)}},true);
var toastT=0;
function toast(en,es,ms){var t=$("toast");t.innerHTML=en+(es?"<i>"+es+"</i>":"");t.classList.add("show");clearTimeout(toastT);toastT=setTimeout(function(){t.classList.remove("show")},ms||5000)}

/* =====================================================================
   ACTIVITY: schedule, title, gallery, step guide, progress
   ===================================================================== */
function slot(){var d=new Date();if(S.days.indexOf(d.getDay())<0)return null;var n=d.getHours()*60+d.getMinutes();
 return S.sched.filter(function(x){return x.on&&n>=mins(x.s)&&n<mins(x.e)})[0]||null}
function near(){var d=new Date(),n=d.getHours()*60+d.getMinutes(),b=null,bd=1e9;S.sched.forEach(function(x){if(!x.on||x.id==="nap")return;var dd=Math.abs((mins(x.s)+mins(x.e))/2-n);if(dd<bd){bd=dd;b=x}});return b?b.id:"arrival"}
function cur(){if(!S.auto)return S.manual;var s=slot();return s?s.id:near()}
function nextOf(id){var i=-1;S.sched.forEach(function(x,k){if(x.id===id)i=k});return S.sched.slice(i+1).filter(function(x){return x.on})[0]||S.sched.filter(function(x){return x.on})[0]||null}
var shown="",curId=null,warned="",pool=POOL.x,gi=0,gc=0;
function showImg(k){var f=[$("art"),$("art2")],nx=1-gc,im=f[nx];im.src=P(k);im.alt=CAP[k]?CAP[k][0]:"";
 var done=false,go=function(){if(done)return;done=true;im.classList.add("v");f[1-nx].classList.remove("v");gc=nx};if(im.decode)im.decode().then(go,go);else im.onload=go;setTimeout(go,1200);
 [].forEach.call($("galdots").children,function(d,i){d.classList.toggle("on",i===gi)})}
function setPool(id){pool=POOL[id]||POOL.x;gi=0;$("galdots").innerHTML=pool.length>1?pool.map(function(){return "<i></i>"}).join(""):"";showImg(pool[0]);rot.gal=Date.now()}
function nextImg(){if(pool.length<2)return;gi=(gi+1)%pool.length;showImg(pool[gi])}
var gs=0;
function drawG(user){var g=GUIDE[curId];if(!g)return;gs=clamp(gs,0,g.length-1);var s=g[gs],t=$("gt");$("gnum").textContent=gs+1;
 t.innerHTML=s[0]+"<i>"+s[1]+"</i>";t.classList.remove("sw");void t.offsetWidth;t.classList.add("sw");
 $("gd").innerHTML=g.map(function(_,i){return '<i class="'+(i===gs?"on":"")+'"></i>'}).join("");
 if(user){sfx("step");say(s[0],s[1])}}
function gstep(d,user){var g=GUIDE[curId];if(!g)return;gs=(gs+d+g.length)%g.length;drawG(user)}
function render(force,user){var id=cur(),sl=slot(),off=S.auto&&!sl,key=[id,S.auto,off,S.h24].join("|");
 if(force||key!==shown){shown=key;var a=ACT[id],changed=id!==curId,prev=curId;curId=id;
  if(changed){setPool(id);gs=0;rainbow($("en"),a.en);$("es").textContent=a.es;$("act").dataset.a=id;
   var tl=TOOL[id];$("gx").style.display=tl?"":"none";if(tl)$("gx").innerHTML=lbl(tl[1],tl[2],tl[3]);
   if(document.activeElement===$("gx")&&!tl)focusOn($("gn"));drawG(false)}
  var nx=nextOf(id),na=nx&&ACT[nx.id];
  $("next").innerHTML=na&&nx.id!==id?"NEXT <span>· Sigue"+(S.auto&&!off?" · "+fmtT(nx.s):"")+"</span><br><b>"+na.en+"</b> <span>/ "+na.es+"</span>":"";
  $("mode").innerHTML=S.auto?ic("check")+"<span>AUTO</span>":lbl("auto","Back to AUTO","Volver al horario");$("mode").className=S.auto?"on":"";$("mode").disabled=S.auto;
  if(S.auto&&document.activeElement===$("mode"))focusOn($("bPick"));
  setNap(id==="nap",changed);chars();
  if(changed&&started&&prev!==null&&id!=="nap"){if(prev==="nap"){if(S.auto&&!user)setTimeout(function(){if(curId===id&&started)announce(id)},2200)}else if(S.auto&&!user)announce(id);else{sfx("chime");say(a.en,a.es)}}}
 drawProg(sl)}
function drawProg(sl){var p=$("prog");
 if(S.auto&&sl){var d=new Date(),n=d.getHours()*60+d.getMinutes()+d.getSeconds()/60,s=mins(sl.s),e=mins(sl.e),left=Math.max(0,Math.ceil(e-n));
  p.className="";$("pgl").textContent=fmtT(sl.s)+" – "+fmtT(sl.e);$("pgb").style.width=clamp((n-s)/(e-s)*100,0,100)+"%";
  $("pgr").textContent=left+" min left · quedan "+left+" min";
  if(S.warnMin&&started&&left===S.warnMin&&warned!==sl.id+sl.e&&e-s>S.warnMin){warned=sl.id+sl.e;var nx=nextOf(sl.id);
   if(nx&&nx.id!==sl.id){toast(S.warnMin+" minutes left","Quedan "+S.warnMin+" minutos · Sigue: "+ACT[nx.id].es,7000);sfx("warn")}}}
 else{p.className="note";$("pgl").textContent=S.auto?"Outside schedule · Fuera de horario — set the times in Teacher · ajusta el horario en el panel":"Manual mode · Modo manual";$("pgr").textContent=""}}
function announce(id){var a=ACT[id];sfx("chime");say(a.en,a.es);
 if(!S.intro||stack.length||welcome){toast("Now: "+a.en,"Ahora: "+a.es,6000);return}
 $("trk").innerHTML="IT'S TIME FOR<i>Es hora de</i>";$("trimg").src=P(THUMB[id]);rainbow($("tren"),a.en);$("tres").textContent=a.es;$("trm").textContent=a.m[0]+" · "+a.m[1];
 pose($("tc1"),"happy","joy");pose($("tc2"),"happy","joy");openOv("tr",$("trx"),true);clearTimeout(trT);trT=setTimeout(closeTr,8000)}
var trT=0;function closeTr(){clearTimeout(trT);closeOv("tr",true)}
function setAuto(){S.auto=true;save();render(true,true);toast("Automatic schedule","Horario automático",3000)}
function pickAct(id){S.auto=false;S.manual=id;save();render(true,true)}

/* =====================================================================
   LEARN: vowels (from the classroom posters) + numbers, colors, shapes
   ===================================================================== */
function miniDuck(){return duckSVG()}
var CARDS=[],li=0;
function buildCards(){CARDS=[];
 if(S.decks.vowels)VOW.forEach(function(v){CARDS.push({deck:"vowels",en:"Letter "+v[0],es:"Letra "+v[0],k:"VOWELS · Vocales",say:[v[0]+". "+v[4][0][1]+". "+v[4][1][1]+".",v[4][0][2]+". "+v[4][1][2]+"."],
   html:'<div class="lc lc-v"><div class="big"><span style="color:var(--'+v[2]+')">'+v[0]+'</span><span style="color:var(--'+v[3]+')">'+v[1]+'</span></div><div class="pics">'+v[4].map(function(w){return '<figure><img src="'+P("w_"+w[0])+'" alt="'+w[1]+'"><figcaption class="cap"><b>'+w[1]+'</b><i>'+w[2]+'</i></figcaption></figure>'}).join("")+'</div></div>'})});
 if(S.decks.numbers)NUM.forEach(function(n,i){var d="";for(var j=0;j<=i;j++)d+=miniDuck();var c=["co","or","ye2","gr2","sk2","pu2"][i%6];
   CARDS.push({deck:"numbers",en:n[0],es:n[1],k:"NUMBERS · Números",say:[n[0]+".",n[1]+"."],html:'<div class="lc lc-n"><div class="big" style="color:var(--'+c+')">'+(i+1)+'</div><div class="col"><div class="cnt">'+d+'</div><div class="cap"><b>'+n[0]+'</b><i>'+n[1]+'</i></div></div></div>'})});
 if(S.decks.colors)COL.forEach(function(c){CARDS.push({deck:"colors",en:c[0],es:c[1],k:"COLORS · Colores",say:[c[0]+".",c[1]+"."],
   html:'<div class="lc lc-c"><svg class="shape" viewBox="0 0 100 100"><path d="M52 6c20-2 38 10 41 30 3 17-4 24-3 37 1 14-14 23-32 21-14-2-20-9-33-10C10 83 3 70 6 54c2-12 9-16 11-27C20 14 34 8 52 6z" fill="'+c[2]+'" stroke="#5C3A21" stroke-width="4" stroke-linejoin="round"/><ellipse cx="36" cy="30" rx="12" ry="7" fill="#fff" opacity=".45" transform="rotate(-28 36 30)"/></svg><div class="cap"><b>'+c[0]+'</b><i>'+c[1]+'</i></div></div>'})});
 if(S.decks.shapes)SHP.forEach(function(s){CARDS.push({deck:"shapes",en:s[0],es:s[1],k:"SHAPES · Figuras",say:[s[0]+".",s[1]+"."],
   html:'<div class="lc lc-s"><svg class="shape" viewBox="0 0 100 100"><g fill="'+s[2]+'" stroke="#5C3A21" stroke-width="4" stroke-linejoin="round">'+s[3]+'</g></svg><div class="cap"><b>'+s[0]+'</b><i>'+s[1]+'</i></div></div>'})});
 li=clamp(li,0,CARDS.length-1);drawDecks();drawLearn()}
function drawLearn(){var c=CARDS[li];$("lc").innerHTML=c.html;[].forEach.call($("decks").children,function(b){b.classList.toggle("on",b.dataset.d===c.deck)})}
function learnGo(d,user){li=(li+d+CARDS.length)%CARDS.length;drawLearn();rot.car=Date.now();if(user){sfx("learn");say(CARDS[li].say[0],CARDS[li].say[1])}}
function drawDecks(){var h=$("decks");h.innerHTML="";DECKS.forEach(function(d){if(!S.decks[d[0]])return;var b=el("button","",d[1]||(d[0]==="colors"?'<svg class="ic f" viewBox="0 0 24 24"><circle cx="8" cy="9" r="5" fill="#F28B80"/><circle cx="16" cy="9" r="5" fill="#6FAEE0"/><circle cx="12" cy="16" r="5" fill="#F7D056"/></svg>':'<svg class="ic" viewBox="0 0 24 24"><path d="M12 3l9 16H3z"/></svg>'));
  b.dataset.d=d[0];b.setAttribute("aria-label",d[2]+" · "+d[3]);b.onclick=function(){for(var i=0;i<CARDS.length;i++)if(CARDS[i].deck===d[0]){li=i;break}drawLearn();rot.car=Date.now();sfx("learn");toast(d[2],d[3],1800)};h.appendChild(b)})}

/* =====================================================================
   EMOTIONS + RULES
   ===================================================================== */
var FEEL0='<div class="q"><b>How do you feel today?</b><i>¿Cómo te sientes hoy?</i></div>',ei=-1,ri=0;
function emoItems(){return EMO.map(function(e,i){return {img:P("emo_"+e[0]),en:"I feel "+e[1].toLowerCase(),es:"Me siento "+e[2].toLowerCase(),k:"EMOTIONS · Las emociones",sfx:e[0],say:["I feel "+e[1].toLowerCase()+".","Me siento "+e[2].toLowerCase()+"."],on:function(){feel(i)}}})}
function feel(i){ei=i;[].forEach.call($("emo").children,function(c,k){c.classList.toggle("sel",k===i)});var f=$("feel");
 if(i<0){f.className="";f.innerHTML=FEEL0;setMood(null);return}
 var e=EMO[i];f.innerHTML='<img src="'+P("emo_"+e[0])+'" alt=""><div><b>I FEEL '+e[1].toUpperCase()+'.</b><i>Me siento '+e[2].toLowerCase()+'.</i></div>';f.className="";void f.offsetWidth;f.className="set";setMood(e[0],12000)}
function drawRule(){[].forEach.call($("rules").children,function(c,i){c.classList.toggle("cur",i===ri)});$("rulel").innerHTML=RULES[ri][1].toUpperCase()+" <i>· "+RULES[ri][2]+"</i>"}
function ruleItems(){return RULES.map(function(r,i){return {img:P("r_"+r[0]),en:r[1],es:r[2],k:"RULE "+(i+1)+" · Norma "+(i+1),on:function(){ri=i;drawRule();rot.rule=Date.now()}}})}

/* =====================================================================
   PICKERS + SPOTLIGHT (big view for pictures, zones, rules, cards, feelings)
   ===================================================================== */
function openPick(){var c=cur();$("pg").innerHTML=ACTS.map(function(a,i){var s=S.sched[i];return '<button data-id="'+a.id+'" class="'+(a.id===c?"on ":"")+(s.on?"":"off")+'"><img src="'+P(THUMB[a.id])+'" alt=""><b>'+a.en+'</b><i>'+a.es+'</i><em>'+(s.on?fmtT(s.s)+" – "+fmtT(s.e):"off · apagada")+'</em></button>'}).join("");
 openOv("pk",$("pg").querySelector(".on"))}
$("pg").onclick=function(e){var b=e.target.closest("button");if(!b)return;closeOv("pk",true);pickAct(b.dataset.id)};
function zoneItems(){return ZONES.map(function(z){return {img:P("z_"+z[0]),en:z[1],es:z[2],k:"ZONE · Zona",wide:true}})}
function openZones(){$("zg").innerHTML=ZONES.map(function(z,i){return '<button data-i="'+i+'"><img src="'+P("z_"+z[0])+'" alt=""><b>'+z[1]+'</b><i>'+z[2]+'</i></button>'}).join("");openOv("zn",$("zg").children[zi])}
$("zg").onclick=function(e){var b=e.target.closest("button");if(!b)return;openSp(zoneItems(),+b.dataset.i)};
var SP=null;
function openSp(items,i){SP={items:items,i:i||0};openOv("sp",$("spn"),true);$("spp").style.display=$("spn").style.display=items.length>1?"":"none";if(items.length<2)focusOn($("spx"));drawSp()}
function drawSp(){var it=SP.items[SP.i];$("spv").innerHTML=it.html||'<img src="'+it.img+'" alt="">';$("spk").textContent=it.k||"";
 rainbow($("spen"),it.en);$("spen").classList.toggle("long",it.en.length>13);$("spes").textContent=it.es;$("spes").classList.toggle("long",it.es.length>24);
 $("sp").classList.toggle("wide",!!it.wide);var N=SP.items.length;$("spd").innerHTML=N>12?'<span class="cnt">'+(SP.i+1)+" / "+N+"</span>":N>1?SP.items.map(function(_,k){return '<i class="'+(k===SP.i?"on":"")+'"></i>'}).join(""):"";
 sfx(it.sfx||"step");var s=it.say||[it.en,it.es];say(s[0],s[1]);if(it.on)it.on()}
function spGo(d){if(!SP||SP.items.length<2)return;SP.i=(SP.i+d+SP.items.length)%SP.items.length;drawSp()}
function closeSp(){hush();closeOv("sp");SP=null}
function galItems(){return pool.map(function(k){var c=CAP[k]||["",""];return {img:P(k),en:c[0],es:c[1],k:"PICTURE · Imagen",wide:k.indexOf("z_")===0}})}

/* =====================================================================
   TIMERS: clean-up, hand washing (with steps), free timer
   ===================================================================== */
var tmI=0,TK={clean:["Clean-up Time","Recoger y ordenar","#F28B80"],wash:["Wash our hands","Lavamos las manos","#6FAEE0"],free:["Timer","Temporizador","#8ED4BD"]};
function startT(kind){if(welcome)return;if(tm)closeT(true);var sec=kind==="clean"?S.cleanMin*60:kind==="wash"?S.wash:S.freeMin*60;
 tm={kind:kind,sec:sec,left:sec,run:true,t:Date.now(),end:0,last:-1};var K=TK[kind];
 rainbow($("tmen"),K[0]);$("tmes").textContent=K[1];$("pied").setAttribute("stroke",K[2]);$("tmok").innerHTML="";$("conf").innerHTML="";
 $("tmpic").innerHTML=kind==="clean"?'<img src="'+P("s_clean")+'" alt="">':kind==="wash"?'<img src="'+P("r_wash")+'" alt="">':'<div class="cast a-hop" id="tmc"><div class="chw">'+charSVG("duck")+'</div></div>';
 $("tmside").innerHTML=kind==="wash"?WASH.map(function(w,i){return '<div class="stp"><em>'+(i+1)+'</em>'+w[0]+'<i>'+w[1]+'</i></div>'}).join("")
  :kind==="clean"?'<div class="tip">Every toy has a home<i>Cada juguete tiene su lugar</i></div>':'<div class="tip">Watch the circle get smaller<i>Mira cómo se achica el círculo</i></div>';
 var u=kind==="wash"?"5 s":"1 min";$("tmm").innerHTML=ic("minus")+"<span>"+u+"</span>";$("tmp").innerHTML=ic("plus")+"<span>"+u+"</span>";
 var tr=AU[kind==="clean"?"cleanup":"wash"];if(kind!=="free"&&tr){try{tr.a.currentTime=0}catch(e){}}
 drawT();openOv("tm",$("tp"),true);sfx("step");say(K[0],K[1]);clearInterval(tmI);tmI=setInterval(tickT,100)}
function drawT(){if(!tm)return;var l=Math.max(0,Math.ceil(tm.left-.001)),C=2*Math.PI*44,fr=clamp(tm.left/tm.sec,0,1);
 $("tmt").textContent=Math.floor(l/60)+":"+pad(l%60);$("pied").setAttribute("stroke-dasharray",(fr*C).toFixed(2)+" "+C.toFixed(2));
 $("tp").innerHTML=tm.run||tm.end?lbl("pause","Pause","Pausa"):lbl("play","Resume","Seguir");$("tp").disabled=$("tmm").disabled=$("tmp").disabled=!!tm.end;
 if(tm.kind==="wash"){var st=Math.min(WASH.length-1,Math.floor((1-fr)*WASH.length));[].forEach.call($("tmside").children,function(c,i){c.className="stp"+(tm.end||i<st?" ok":i===st?" on":"")})}}
function tickT(){if(!tm)return;var n=Date.now();
 if(tm.run){tm.left-=(n-tm.t)/1000;tm.t=n;var l=Math.ceil(tm.left);
  if(l!==tm.last&&l<=5&&l>0&&tm.left>0)sfx("tick");
  if(tm.kind==="wash"&&l!==tm.last&&l>5&&l%4===0)sfx("bubble",.5);tm.last=l;
  if(tm.left<=0){tm.left=0;tm.run=false;tm.end=n;$("tmok").innerHTML="ALL DONE!<i>¡Terminamos!</i>";sfx("done");confetti();cheer();if(document.activeElement&&document.activeElement.disabled!==false)focusOn($("trs"));
   var c=$("tmc");if(c)c.className="cast mood-happy a-joy";setTimeout(function(){say("All done! Great job!","¡Terminamos! ¡Buen trabajo!")},900)}}
 drawT();if(tm.end&&n-tm.end>8000)closeT()}
function closeT(quiet){clearInterval(tmI);tm=null;closeOv("tm",quiet)}
function adjT(d){if(!tm||tm.end)return;var u=tm.kind==="wash"?5:60,min=tm.kind==="wash"?5:60;var nl=tm.left+d*u;if(nl<min/2){sfx("bump");return}tm.left=nl;tm.sec=Math.max(tm.sec+d*u,tm.left);tm.t=Date.now();drawT()}
function confetti(){var c=$("conf"),cols=["#F28B80","#F5AD65","#F7D056","#8ED4BD","#6FAEE0","#A98BD4"],h="";for(var i=0;i<44;i++)h+='<i style="left:'+(Math.random()*100)+'%;background:'+cols[i%6]+';animation-delay:'+(Math.random()*.9)+'s;animation-duration:'+(1.8+Math.random()*1.6)+'s"></i>';c.innerHTML=h;setTimeout(function(){c.innerHTML=""},4200)}

/* =====================================================================
   TEACHER PANEL: every control is a button, so the remote can do it all
   ===================================================================== */
var tab="gen";
function applyAll(){save();dimUp();buildCards();render(true,true);tick(true);drawMusic()}
function row(par,en,es,cls){var r=el("div","srow"+(cls?" "+cls:""));r.appendChild(el("div","lab",en+"<i>"+es+"</i>"));var c=el("div","ctl");r.appendChild(c);par.appendChild(r);return c}
function sbtn(c,html,fn,cls,aria){var b=el("button",cls||"",html);if(aria)b.setAttribute("aria-label",aria);b.onclick=fn;c.appendChild(b);return b}
function rStep(par,en,es,get,set,o){var c=row(par,en,es),out=el("output"),upd=function(){out.textContent=o.fmt?o.fmt(get()):get()};
 var mv=function(d){var v=clamp(get()+d*o.step,o.min,o.max);if(v===get()){sfx("bump");return}set(v);upd();applyAll();if(o.after)o.after()};
 sbtn(c,ic("minus"),function(){mv(-1)},"sq",en+" −");c.appendChild(out);sbtn(c,ic("plus"),function(){mv(1)},"sq",en+" +");upd();return c}
function rTog(par,en,es,get,set,after){var c=row(par,en,es),b=sbtn(c,"",function(){set(!get());d();applyAll();if(after)after()}),d=function(){b.innerHTML=get()?ic("check")+"<span>ON · Sí</span>":"<span>OFF · No</span>";b.className=get()?"on":""};d();return c}
function rSeg(par,en,es,opts,get,set,after){var c=row(par,en,es),bs=opts.map(function(o){return sbtn(c,o[1],function(){set(o[0]);d();applyAll();if(after)after()})}),d=function(){bs.forEach(function(b,i){b.className=opts[i][0]===get()?"on":""})};d();return c}
function drawSet(){var b=$("setb");b.innerHTML="";b.scrollTop=0;[].forEach.call($("tabs").children,function(t){t.className=t.dataset.t===tab?"on":""});
 if(tab==="gen"){
  rSeg(b,"Mode","Modo",[[true,"Automatic schedule · Horario automático"],[false,"Manual"]],function(){return S.auto},function(v){S.auto=v});
  var c=row(b,"Activity in manual mode","Actividad en modo manual"),out=el("output");out.style.minWidth="330px";var up=function(){out.textContent=ACT[S.manual].en},mv=function(d){var i=ACTS.indexOf(ACT[S.manual]);S.manual=ACTS[(i+d+ACTS.length)%ACTS.length].id;up();applyAll()};
  sbtn(c,ic("left"),function(){mv(-1)},"sq","Previous activity");c.appendChild(out);sbtn(c,ic("right"),function(){mv(1)},"sq","Next activity");up();
  c=row(b,"School days","Días de clase");["Sun·Dom","Mon·Lun","Tue·Mar","Wed·Mié","Thu·Jue","Fri·Vie","Sat·Sáb"].forEach(function(n,i){var bt=sbtn(c,n,function(){var k=S.days.indexOf(i);if(k<0)S.days.push(i);else S.days.splice(k,1);bt.className=S.days.indexOf(i)>=0?"on":"";applyAll()},S.days.indexOf(i)>=0?"on":"")});
  rTog(b,"Announce each new activity","Anunciar cada cambio de actividad",function(){return S.intro},function(v){S.intro=v});
  rSeg(b,"Warn before the activity ends","Avisar antes de que termine",[[0,"Off · No"],[2,"2 min"],[5,"5 min"],[10,"10 min"]],function(){return S.warnMin},function(v){S.warnMin=v});
  c=row(b,"Learning cards","Tarjetas de aprendizaje");DECKS.forEach(function(d){var bt=sbtn(c,d[2]+" · "+d[3],function(){S.decks[d[0]]=!S.decks[d[0]];if(!DECKS.some(function(x){return S.decks[x[0]]})){S.decks[d[0]]=true;sfx("bump")}bt.className=S.decks[d[0]]?"on":"";applyAll()},S.decks[d[0]]?"on":"")});
  rStep(b,"Learning card changes every","La tarjeta cambia cada",function(){return S.carSec},function(v){S.carSec=v},{min:10,max:600,step:10,fmt:function(v){return v+" s"}});
  rStep(b,"Activity picture changes every","La imagen cambia cada",function(){return S.galSec},function(v){S.galSec=v},{min:4,max:120,step:2,fmt:function(v){return v+" s"}});
  rStep(b,"Classroom rule changes every","La norma cambia cada",function(){return S.ruleSec},function(v){S.ruleSec=v},{min:5,max:120,step:5,fmt:function(v){return v+" s"}});
  rStep(b,"Hand-washing timer","Temporizador de lavado de manos",function(){return S.wash},function(v){S.wash=v},{min:10,max:120,step:5,fmt:function(v){return v+" s"}});
  rStep(b,"Clean-up timer","Temporizador para recoger",function(){return S.cleanMin},function(v){S.cleanMin=v},{min:1,max:20,step:1,fmt:function(v){return v+" min"}});
  rStep(b,"Free timer","Temporizador libre",function(){return S.freeMin},function(v){S.freeMin=v},{min:1,max:60,step:1,fmt:function(v){return v+" min"}});
  rSeg(b,"Clock","Reloj",[[false,"12 h"],[true,"24 h"]],function(){return S.h24},function(v){S.h24=v});
  rStep(b,"Screen dimming","Atenuar la pantalla",function(){return S.dim},function(v){S.dim=v},{min:0,max:70,step:10,fmt:function(v){return v+" %"}});
  c=row(b,"Screen","Pantalla");sbtn(c,lbl("full","Fullscreen","Pantalla completa"),fs);sbtn(c,lbl("home","Welcome screen","Bienvenida"),function(){closeOv("set",true);goHome()});
 }else if(tab==="snd"){
  rTog(b,"Background music","Música de fondo",function(){return S.music},function(v){S.music=v});
  rStep(b,"Music volume","Volumen de la música",function(){return S.vol},function(v){S.vol=v},{min:0,max:100,step:10,fmt:function(v){return v+" %"}});
  rStep(b,"Sound effects volume","Volumen de los efectos",function(){return S.sfx},function(v){S.sfx=v},{min:0,max:100,step:10,fmt:function(v){return v+" %"},after:function(){sfx("chime")}});
  rTog(b,"Voice: say the words in English and Spanish"+(SY?"":" (not available on this screen)"),"Voz: decir las palabras en inglés y español"+(SY?"":" (no disponible en esta pantalla)"),function(){return S.voice},function(v){S.voice=v},function(){if(S.voice)say("Hello, friends!","¡Hola, amigos!");else hush()});
  rTog(b,"Music during clean-up and hand washing","Música al recoger y al lavarse las manos",function(){return S.timerMusic},function(v){S.timerMusic=v});
  rSeg(b,"During nap time","Durante la siesta",[["lullaby","Lullaby · Canción de cuna"],["quiet","Quiet music · Música bajita"],["off","Silence · Silencio"]],function(){return S.napSound},function(v){S.napSound=v});
  var c2=row(b,"Try the sounds","Probar los sonidos");[["chime","Chime · Campana"],["quack","Duck · Patito"],["bear","Bear · Osito"],["done","Celebration · Celebración"]].forEach(function(x){sbtn(c2,x[1],function(){sfx(x[0])})});
 }else{
  b.appendChild(el("div","snote","These times are examples: change them to match your classroom · Estos horarios son ejemplos: ajústalos a tu salón"));
  S.sched.forEach(function(x){var a=ACT[x.id],r=el("div","srow sch");r.appendChild(el("div","lab",a.en+"<i>"+a.es+"</i>"));var c=el("div","ctl");r.appendChild(c);b.appendChild(r);
   var on=sbtn(c,"",function(){x.on=!x.on;d();applyAll()}),o1=el("output"),o2=el("output");
   var d=function(){on.innerHTML=x.on?ic("check")+"<span>ON</span>":"<span>OFF</span>";on.className=x.on?"on":"";o1.textContent=fmtT(x.s);o2.textContent=fmtT(x.e);r.className="srow sch"+(mins(x.e)<=mins(x.s)?" bad":"")+(x.on?"":" dis")};
   var mv=function(f,dd){var v=clamp(mins(x[f])+dd*5,0,1435);x[f]=hhmm(v);d();applyAll()};
   c.appendChild(el("span","tl","Start · Inicio"));sbtn(c,ic("minus"),function(){mv("s",-1)},"sq",a.en+" start −5");c.appendChild(o1);sbtn(c,ic("plus"),function(){mv("s",1)},"sq",a.en+" start +5");
   c.appendChild(el("span","tl","End · Fin"));sbtn(c,ic("minus"),function(){mv("e",-1)},"sq",a.en+" end −5");c.appendChild(o2);sbtn(c,ic("plus"),function(){mv("e",1)},"sq",a.en+" end +5");d()})}}
function openSet(){tab="gen";drawSet();openOv("set",$("tabs").children[0])}
[["gen","General"],["snd","Sound · Sonido"],["sch","Schedule · Horario"]].forEach(function(t){var b=el("button","",t[1]);b.dataset.t=t[0];b.onclick=function(){tab=t[0];drawSet();sfx("step")};$("tabs").appendChild(b)});
var rz=0;
$("sz").onclick=function(){var n=Date.now();if(n-rz>4000){rz=n;toast("Press again to reset everything","Presiona otra vez para restablecer todo",4000);sfx("warn",.6);return}rz=0;S=DEF();applyAll();drawSet();focusOn($("sz"));toast("Settings reset","Ajustes restablecidos",3000)};
$("sx").onclick=function(){closeOv("set")};

/* =====================================================================
   NAP · MUSIC · WELCOME
   ===================================================================== */
function setNap(n,changed){if(n===isNap)return;isNap=n;document.body.classList.toggle("night",n);$("bNap").classList.toggle("on",n);$("bNap").innerHTML=n?lbl("sun","Wake up","Despertar"):lbl("moon","Nap","Siesta");
 if(n)hush();if(started)sfx(n?"nap":"wake",n?2.5:1)}
function toggleNap(){if(welcome)return;if(cur()==="nap"){if(S.auto){var nx=nextOf("nap");S.auto=false;S.manual=nx&&nx.id!=="nap"?nx.id:"story"}else S.auto=true}else{S.auto=false;S.manual="nap"}save();render(true,true)}
function drawMusic(){var on=S.music;$("bMusic").innerHTML=lbl(on?"music":"mute",on?"Music on":"Music off",on?"Con música":"Sin música");$("bMusic").classList.toggle("on",on);
 var h="",lv=Math.round(S.vol/10);for(var i=1;i<=10;i++)h+='<i class="'+(i<=lv?"on":"")+'" style="height:'+(8+i*3.2)+'px"></i>';$("volm").innerHTML=h}
function toggleMusic(){S.music=!S.music;save();drawMusic();toast(S.music?"Music on":"Music off",S.music?"Música encendida":"Música apagada",1800)}
function vol(d){var v=clamp(S.vol+d,0,100);if(v===S.vol){sfx("bump");return}S.vol=v;save();drawMusic()}
function fs(){try{var d=document,e=d.documentElement,p=d.fullscreenElement||d.webkitFullscreenElement?(d.exitFullscreen||d.webkitExitFullscreen).call(d):(e.requestFullscreen||e.webkitRequestFullscreen).call(e);if(p&&p.catch)p.catch(function(){})}catch(x){}}
function dimUp(){$("dim").style.opacity=S.dim/100}
function greet(){var h=new Date().getHours();return h<12?["Good morning!","¡Buenos días!"]:h<18?["Good afternoon!","¡Buenas tardes!"]:["Good evening!","¡Buenas noches!"]}
function start(){if(!welcome)return;welcome=false;started=true;initAudio();$("wel").classList.remove("show");sfx("start");var g=greet();setTimeout(function(){say("Welcome! "+g[0],"¡Bienvenidos! "+g[1])},1500);
 try{var d=document;if(!(d.fullscreenElement||d.webkitFullscreenElement)&&window.top===window.self)fs()}catch(e){}
 shown="";render(true);cheer();focusOn($("gn"));wake()}
function goHome(){if(welcome)return;while(stack.length)back();hush();welcome=true;started=false;var g=greet();$("wgr").textContent=g[0]+" · "+g[1];$("wel").classList.add("show");focusOn($("go"))}

/* =====================================================================
   BUILD THE STATIC PARTS + WIRE BUTTONS
   ===================================================================== */
brand($("brand"));brand($("wbrand"));
mount("c1","duck");mount("c2","bear");mount("wc1","duck");mount("wc2","bear");mount("tc1","duck");mount("tc2","bear");
pose($("wc1"),"happy","wave");pose($("wc2"),"happy","wave");
$("bVd").innerHTML=ic("vd");$("bVu").innerHTML=ic("vu");$("bFs").innerHTML=ic("full");$("bNap").innerHTML=lbl("moon","Nap","Siesta");$("bHome").innerHTML=lbl("home","Home","Inicio");$("bSet").innerHTML=lbl("gear","Teacher","Maestra");
$("bPick").innerHTML=lbl("grid","Activities","Actividades");$("gp").innerHTML=ic("left");$("gn").innerHTML=lbl("","Next step","Siguiente paso")+ic("right");$("gn").querySelector(".ic").style.marginLeft="10px";
$("lp").innerHTML=ic("left");$("ln").innerHTML=ic("right");$("bEr").innerHTML=ic("reset")+"<span>Reset</span>";
$("bZones").innerHTML=lbl("pin","Zones","Zonas");$("bTimer").innerHTML=lbl("timer","Timer","Temporizador");$("bClean").innerHTML=lbl("box","Clean-up","Recoger");$("bWash").innerHTML=lbl("drop","Wash hands","Lavar manos");
$("pa").innerHTML=lbl("auto","Automatic schedule","Horario automático");$("px").innerHTML=lbl("close","Close","Cerrar");$("zx").innerHTML=lbl("close","Close","Cerrar");
$("spp").innerHTML=lbl("left","Previous","Anterior");$("spn").innerHTML=lbl("","Next","Siguiente")+ic("right");$("spn").querySelector(".ic").style.marginLeft="10px";$("spx").innerHTML=lbl("close","Close","Cerrar");
$("trs").innerHTML=lbl("reset","Restart","Reiniciar");$("tx").innerHTML=lbl("close","Close","Cerrar");$("trx").innerHTML=lbl("check","OK","Listo");
$("sx").innerHTML=lbl("check","Done","Listo");$("sz").innerHTML=lbl("reset","Reset everything","Restablecer todo");
$("go").innerHTML=ic("play","f")+"<span>START · EMPEZAR</span>";
rainbow($("wh"),"WELCOME");$("wart").src=P("s_arrival");(function(){var g=greet();$("wgr").textContent=g[0]+" · "+g[1]})();
EMO.forEach(function(e,i){var b=el("button","",'<img src="'+P("emo_"+e[0])+'" alt=""><span>'+e[1].toUpperCase()+'</span>');b.setAttribute("aria-label",e[1]+" · "+e[2]);b.onclick=function(){openSp(emoItems(),i)};$("emo").appendChild(b)});
RULES.forEach(function(r,i){var b=el("button","",'<img src="'+P("r_"+r[0])+'" alt="">');b.setAttribute("aria-label",r[1]+" · "+r[2]);b.onclick=function(){openSp(ruleItems(),i)};$("rules").appendChild(b)});
(function(){var n=$("nightfx"),i,s;for(i=0;i<16;i++){var sz=18+Math.random()*26;s=el("div","");s.innerHTML='<svg viewBox="0 0 24 24" style="left:'+(Math.random()*96)+'%;top:'+(4+Math.random()*88)+'%;width:'+sz+'px;height:'+sz+'px;animation-delay:'+(-Math.random()*6)+'s"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/></svg>';n.appendChild(s.firstChild)}
 for(i=0;i<3;i++){s=el("div","z","Zzz");s.style.cssText="left:"+(16+i*14+Math.random()*6)+"%;top:"+(16+Math.random()*12)+"%;font-size:"+(26+Math.random()*24)+"px;animation-delay:"+(-Math.random()*7)+"s";n.appendChild(s)}})();
$("go").onclick=start;$("wel").addEventListener("click",function(e){if(!e.target.closest("button"))start()});
$("bHome").onclick=goHome;$("bSet").onclick=openSet;$("bNap").onclick=toggleNap;$("bMusic").onclick=toggleMusic;$("bVd").onclick=function(){vol(-10)};$("bVu").onclick=function(){vol(10)};$("bFs").onclick=fs;
$("bPick").onclick=openPick;$("mode").onclick=setAuto;$("pa").onclick=function(){closeOv("pk",true);setAuto()};$("px").onclick=function(){closeOv("pk")};$("zx").onclick=function(){closeOv("zn")};
$("gp").onclick=function(){gstep(-1,true)};$("gn").onclick=function(){gstep(1,true)};$("gx").onclick=function(){var t=TOOL[curId];if(t)startT(t[0])};
$("c1").onclick=function(){poke($("c1"))};$("c2").onclick=function(){poke($("c2"))};$("galb").onclick=function(){openSp(galItems(),gi)};
$("lp").onclick=function(){learnGo(-1,true)};$("ln").onclick=function(){learnGo(1,true)};
$("lcb").onclick=function(){openSp(CARDS.map(function(c,i){return {html:c.html,en:c.en,es:c.es,k:c.k,say:c.say,sfx:"learn",on:function(){li=i;drawLearn();rot.car=Date.now()}}}),li)};
$("bEr").onclick=function(){feel(-1);sfx("back")};
$("bZones").onclick=openZones;$("bTimer").onclick=function(){startT("free")};$("bClean").onclick=function(){startT("clean")};$("bWash").onclick=function(){startT("wash")};
$("spp").onclick=function(){spGo(-1)};$("spn").onclick=function(){spGo(1)};$("spx").onclick=closeSp;
$("tx").onclick=function(){closeT()};$("tp").onclick=function(){if(!tm||tm.end)return;tm.run=!tm.run;tm.t=Date.now();drawT()};
$("trs").onclick=function(){if(!tm)return;tm.left=tm.sec;tm.run=true;tm.end=0;tm.t=Date.now();tm.last=-1;$("tmok").innerHTML="";drawT()};
$("tmm").onclick=function(){adjT(-1)};$("tmp").onclick=function(){adjT(1)};$("trx").onclick=closeTr;
[].forEach.call(document.querySelectorAll(".ov"),function(o){o.addEventListener("click",function(e){if(e.target===o&&o.id!=="wel")back()})});

/* =====================================================================
   ONE CLOCK drives everything that rotates
   ===================================================================== */
var rot={car:Date.now(),rule:Date.now(),gal:Date.now(),msg:Date.now(),zone:Date.now(),jit:Date.now()},ti=0,zi=0,lastMin=-1;
function drawTick(an){var t=$("tick");t.innerHTML="<b>"+MSG[ti][0].toUpperCase()+"</b><i>"+MSG[ti][1]+"</i>";if(an){t.classList.remove("sw");void t.offsetWidth;t.classList.add("sw")}}
function drawZone(an){var z=ZONES[zi],c=$("zchip");$("zci").src=P("z_"+z[0]);$("zce").textContent=z[1];$("zcs").textContent=z[2];if(an){c.classList.remove("sw");void c.offsetWidth;c.classList.add("sw")}}
function tick(force){var d=new Date(),now=d.getTime(),h=d.getHours();
 if(force===true||d.getMinutes()!==lastMin){lastMin=d.getMinutes();
  $("clock").innerHTML=S.h24?pad(h)+":"+pad(d.getMinutes()):(h%12||12)+":"+pad(d.getMinutes())+"<small>"+(h<12?"AM":"PM")+"</small>";
  $("date").innerHTML="<b>"+DN[d.getDay()]+", "+MN[d.getMonth()]+" "+d.getDate()+"</b>"+DE[d.getDay()]+", "+d.getDate()+" de "+ME[d.getMonth()]}
 if(now-rot.car>=S.carSec*1000){rot.car=now;if(!stack.length)learnGo(1,false)}
 if(now-rot.rule>=S.ruleSec*1000){rot.rule=now;ri=(ri+1)%RULES.length;drawRule()}
 if(now-rot.gal>=S.galSec*1000){rot.gal=now;nextImg()}
 if(now-rot.msg>=8000){rot.msg=now;ti=(ti+1)%MSG.length;drawTick(true)}
 if(now-rot.zone>=15000){rot.zone=now;zi=(zi+1)%ZONES.length;drawZone(true)}
 if(now-rot.jit>=60000){rot.jit=now;jx=Math.round(Math.random()*8-4);jy=Math.round(Math.random()*8-4);fit()}
 render(false)}
feel(-1);drawRule();drawTick(false);drawZone(false);drawMusic();dimUp();buildCards();tick(true);setInterval(tick,1000);focusOn($("go"));
/* warm the image cache so nothing pops in on the TV */
setTimeout(function(){var all=Object.keys(CAP).concat(EMO.map(function(e){return "emo_"+e[0]}));VOW.forEach(function(v){v[4].forEach(function(w){all.push("w_"+w[0])})});all.forEach(function(k){var i=new Image();i.src=P(k)})},800);
/* offline cache when served over https (GitHub Pages); skipped inside previews */
try{if("serviceWorker" in navigator&&window.top===window.self&&(location.protocol==="https:"||location.hostname==="localhost"))navigator.serviceWorker.register("sw.js").catch(function(){})}catch(e){}
window.HDA={state:function(){return {S:S,cur:curId,nap:isNap,welcome:welcome,started:started,stack:stack.map(function(s){return s.id}),timer:tm&&{kind:tm.kind,left:tm.left,run:tm.run,end:!!tm.end},card:li,emotion:ei,want:desired(),bufs:Object.keys(bufs).length,audio:Object.keys(AU).map(function(n){var a=AU[n].a;return {n:n,paused:a.paused,t:a.currentTime,vol:a.volume,src:a.currentSrc.split("/").pop(),err:a.error&&a.error.code}})}}};
})();
