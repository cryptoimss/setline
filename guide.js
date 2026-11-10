'use strict';
const guideExercises = [
 {id:'guide-row',title:'Remo suave con banda',label:'Para revisar primero',text:'Llevá los codos cerca del cuerpo, sin encoger los hombros. La resistencia tiene que adaptarse a lo que tolerás, no a la del video.',gif:'./assets/shoulder/guide/band-row.gif',poster:'./assets/shoulder/guide/band-row.jpg',source:'https://www.youtube.com/watch?v=_hnWc4kwVZg'},
 {id:'guide-isometric',title:'Rotación externa isométrica',label:'Sin mover el brazo',text:'Con el codo junto al cuerpo, generá una presión suave hacia fuera contra una superficie o resistencia estable. El hombro no gira: es una contracción sin movimiento. Por eso el GIF parece casi quieto. Confirmá la técnica y esfuerzo con tu fisio.',gif:'./assets/shoulder/guide/isometric-er.gif',poster:'./assets/shoulder/guide/isometric-er.jpg',source:'https://www.youtube.com/watch?v=kWtMKNnjyd0'},
 {id:'guide-scapula',title:'Control escapular de tu hoja',label:'Médico · figura 9.25d',text:'Extensión del brazo acostado boca abajo. Es una de las referencias escapulares de la hoja, no una elección definitiva para tu fase actual. La demostración usa mancuerna: no implica que debas usarla ni copiar su carga.',gif:'./assets/shoulder/doctor/ref-prone-extension.gif',poster:'./assets/shoulder/doctor/ref-prone-extension.jpg',source:'https://www.youtube.com/watch?v=3l1gpGWWXXM'},
 {id:'guide-curl',title:'Curl liviano, opcional',label:'Solo si tolerás la carga',text:'Flexión de codo con palma hacia arriba y descenso controlado. La animación solo muestra el gesto, no la carga. No es obligatorio: dejalo para cuando la carga sea tolerable y no estés en una fase muy irritable. Validá con tu profesional cuándo incorporarlo.',gif:'./assets/shoulder/guide/curl.gif',poster:'./assets/shoulder/guide/curl.jpg',source:'https://raw.githubusercontent.com/JahelCuadrado/ExerciseGymGifsDB/main/biceps/dumbbell-biceps-curl.gif'}
];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root=document.querySelector('#guide-cards');
for(const e of guideExercises){
 const card=document.createElement('article');card.className='guide-card';card.dataset.guideCard=e.id;
 const kicker=document.createElement('div');kicker.className='guide-kicker';kicker.textContent=e.label;card.append(kicker);
 const title=document.createElement('h2');title.textContent=e.title;card.append(title);
 if(e.gif){const img=document.createElement('img');img.alt='Demostración: '+e.title;img.src=reduced?e.poster:e.gif;card.append(img);const b=document.createElement('button');b.type='button';let playing=!reduced;function update(){b.textContent=playing?'Pausar GIF':'Reproducir GIF';b.setAttribute('aria-pressed',String(playing));}update();b.addEventListener('click',()=>{playing=!playing;img.src=playing?e.gif:e.poster;update()});card.append(b);}
 const text=document.createElement('p');text.textContent=e.text;card.append(text);
 const link=document.createElement('a');link.href=e.source;link.textContent=e.gif?'Ver demostración original ↗':'Ver técnica en fuente clínica ↗';link.target='_blank';link.rel='noopener noreferrer';card.append(link);root.append(card);
}
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
