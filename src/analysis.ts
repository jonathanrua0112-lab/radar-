import type {Match} from "./api";
import {isFinishedStatus} from "./api";
const done=(m:Match)=>isFinishedStatus(m.status)&&typeof m.homeScore==="number"&&typeof m.awayScore==="number";
export function signals(ms:Match[]){
  const h=ms.filter(done).slice(-20);
  if(h.length<3)return [];
  const over=h.filter(m=>m.homeScore!+m.awayScore!>=2).length/h.length;
  const btts=h.filter(m=>m.homeScore!>0&&m.awayScore!>0).length/h.length;
  const avg=h.reduce((s,m)=>s+m.homeScore!+m.awayScore!,0)/h.length;
  return[
    {market:"Más de 1.5 goles",value:Math.round(over*100)+"%",sample:h.length},
    {market:"Ambos marcan",value:Math.round(btts*100)+"%",sample:h.length},
    {market:"Goles por partido",value:avg.toFixed(2),sample:h.length}
  ];
}
export function mainSignal(ms:Match[]){
  const s=signals(ms);
  if(!s.length)return{title:"Sin señal",detail:"Muestra real insuficiente para calcular una señal."};
  const pct=s.filter(x=>x.market!=="Goles por partido").sort((a,b)=>parseFloat(b.value)-parseFloat(a.value))[0]||s[0];
  return{title:pct.market,detail:pct.value+" en "+pct.sample+" partidos reales"};
}
