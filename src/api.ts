export const API_BASE = "https://openfootapi.com/v1";
export type Competition={id:string;name:string;country?:string;[key:string]:any};
export type Match={id:string;competitionId:string;status:string;kickoffAt:string;homeTeam?:{id:string;name:string};awayTeam?:{id:string;name:string};homeScore?:number|null;awayScore?:number|null;round?:string};
type Env<T>={data:T;meta?:any;error?:any};
const KEY=process.env.EXPO_PUBLIC_OPENFOOT_API_KEY;
const headers:Record<string,string>={Accept:"application/json"};
if(KEY) headers.Authorization="Bearer "+KEY;
async function get<T>(path:string):Promise<Env<T>>{const r=await fetch(API_BASE+path,{headers});const b=await r.json();if(!r.ok)throw new Error(b?.error?.message||"HTTP "+r.status);return b;}
export async function competitions(){return (await get<Competition[]>("/competitions")).data;}
export async function matches(p:Record<string,string|undefined>){const q=new URLSearchParams();Object.entries(p).forEach(([k,v])=>v&&q.set(k,v));return (await get<Match[]>("/matches?"+q.toString())).data;}
export async function scorers(id:string){return (await get<any[]>("/scorers?competition="+encodeURIComponent(id))).data;}
export async function context(id:string){return (await get<any>("/matches/"+encodeURIComponent(id)+"/context")).data;}
export async function events(id:string){return (await get<any[]>("/matches/"+encodeURIComponent(id)+"/events")).data;}
