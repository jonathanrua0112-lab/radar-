export const TARGETS=[
{key:"laliga",name:"LaLiga",aliases:["la liga","primera división","primera division"],country:"Spain"},
{key:"epl",name:"Premier League",aliases:["premier league","english premier league"],country:"England"},
{key:"seriea-it",name:"Serie A Italia",aliases:["serie a italy","serie a italia"],country:"Italy"},
{key:"seriea-br",name:"Serie A Brasil",aliases:["serie a brazil","brasileirão","brasileirao"],country:"Brazil"},
{key:"betplay",name:"Liga BetPlay Colombia",aliases:["liga betplay","primera a","categoria primera a","categoría primera a"],country:"Colombia"},
{key:"argentina",name:"Liga Profesional Argentina",aliases:["liga profesional argentina","liga profesional","primera división argentina","primera division argentina"],country:"Argentina"}] as const;
export function findTarget(name:string,country?:string){const n=name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");const c=(country||"").toLowerCase();return TARGETS.find(t=>t.aliases.some(a=>n.includes(a))&&c.includes(t.country.toLowerCase()))||TARGETS.find(t=>t.aliases.some(a=>n.includes(a)));}
