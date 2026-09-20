import React,{useEffect,useMemo,useState}from"react";
import{ActivityIndicator,FlatList,Pressable,SafeAreaView,ScrollView,StyleSheet,Text,View}from"react-native";
import{StatusBar}from"expo-status-bar";
import{competitions,matches,scorers,context,events,isLiveStatus,isFinishedStatus}from"./src/api";
import{TARGETS,findTarget}from"./src/leagues";
import{signals,mainSignal}from"./src/analysis";

const C={bg:"#07111f",card:"#0d1b2a",text:"#f3f7fb",muted:"#8fa5ba",accent:"#27d17f",line:"#1d334b",warn:"#ffca58",red:"#ff6577"};
const day=()=>new Date().toISOString().slice(0,10);
const fmt=(x:string)=>new Date(x).toLocaleString("es-CO",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
const safeName=(x:any,fallback:string)=>x?.name||fallback;

export default function App(){
 const[tab,setTab]=useState<"radar"|"live"|"players"|"history">("radar");
 const[league,setLeague]=useState(TARGETS[0].key);
 const[games,setGames]=useState<any[]>([]),[hist,setHist]=useState<any[]>([]),[players,setPlayers]=useState<any[]>([]);
 const[loading,setLoading]=useState(true),[error,setError]=useState(""),[selected,setSelected]=useState<any>(null);
 const target=TARGETS.find(x=>x.key===league)!;
 const load=async()=>{
  setLoading(true);setError("");
  try{
   const cats=await competitions();
   const comp=cats.find((x:any)=>findTarget(x.name,x.country)?.key===league);
   if(!comp)throw new Error("La liga no está disponible en la cobertura actual.");
   const d=new Date();d.setDate(d.getDate()-45);
   const[g,h,p]=await Promise.all([
    matches({competition:comp.id,date:day()}),
    matches({competition:comp.id,date_from:d.toISOString().slice(0,10),date_to:day()}),
    scorers(comp.id).catch(()=>[])
   ]);
   setGames(g);setHist(h);setPlayers(p);
  }catch(e:any){setError(e.message||"No se pudo cargar la fuente real.");}
  finally{setLoading(false)}
 };
 useEffect(()=>{load()},[league]);
 const live=useMemo(()=>games.filter(x=>isLiveStatus(x.status)),[games]);
 const sig=mainSignal(hist),ss=signals(hist);
 const data=tab==="history"?hist:tab==="live"?live:[];
 return <SafeAreaView style={s.safe}>
  <StatusBar style="light"/>
  <View style={s.header}><View><Text style={s.brand}>RADAR</Text><Text style={s.sub}>PARTIDOS · DATOS REALES</Text></View><Text style={s.live}>● EN VIVO</Text></View>
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chips}><View style={{flexDirection:"row",gap:8,padding:14}}>{TARGETS.map(t=><Pressable key={t.key} onPress={()=>setLeague(t.key)} style={[s.chip,league===t.key&&s.on]}><Text style={[s.chipT,league===t.key&&s.onT]}>{t.name}</Text></Pressable>)}</View></ScrollView>
  {error&&<View style={s.err}><Text style={s.errT}>Fuente no disponible</Text><Text style={s.muted}>{error}</Text><Pressable onPress={load}><Text style={s.retry}>Reintentar</Text></Pressable></View>}
  {loading?<View style={s.center}><ActivityIndicator color={C.accent} size="large"/><Text style={s.muted}>Consultando datos reales…</Text></View>:
   <FlatList data={data} keyExtractor={x=>String(x.id)} contentContainerStyle={s.list}
    ListHeaderComponent={<View>
     <Text style={s.kicker}>{target.name}</Text>
     <Text style={s.title}>{tab==="radar"?"Radar estadístico":tab==="players"?"Jugadores":tab==="live"?"Radar en vivo":"Historial"}</Text>
     <Text style={s.muted}>Solo datos entregados por la fuente. Sin estadísticas inventadas.</Text>
     {tab==="radar"&&<><View style={s.signal}><Text style={s.kicker}>SEÑAL ESTADÍSTICA PRINCIPAL</Text><Text style={s.sigTitle}>{sig.title}</Text><Text style={s.muted}>{sig.detail}</Text></View><Text style={s.section}>Mercados descriptivos</Text>{ss.map(x=><View style={s.row} key={x.market}><Text style={s.rowT}>{x.market}</Text><Text style={s.metric}>{x.value}</Text></View>)}</>}
     {tab==="players"&&(players.length?players.slice(0,20).map((p:any,i)=><View style={s.row} key={p.id||i}><View><Text style={s.rowT}>{safeName(p.player,p.name||"Jugador")}</Text><Text style={s.muted}>{p.team?.name||p.club?.name||"Equipo no informado"}</Text></View><Text style={s.metric}>{p.goals??p.total??"—"}</Text></View>):<Text style={s.muted}>La fuente no entrega goleadores para esta competición o temporada.</Text>)}
     {(tab==="live"||tab==="history")&&<Text style={s.section}>{tab==="live"?"Partidos actualmente en vivo":"Partidos del historial disponible"}</Text>}
     {tab==="radar"&&<Text style={s.section}>Partidos de hoy</Text>}
    </View>}
    renderItem={({item})=><Pressable style={s.match} onPress={()=>setSelected(item)}>
      <Text style={s.status}>{isLiveStatus(item.status)?"● EN VIVO":isFinishedStatus(item.status)?"FINAL":fmt(item.kickoffAt)}</Text>
      <Text style={s.team}>{safeName(item.homeTeam,"Local")} <Text style={s.score}>{item.homeScore??"-"}</Text></Text>
      <Text style={s.team}>{safeName(item.awayTeam,"Visitante")} <Text style={s.score}>{item.awayScore??"-"}</Text></Text>
    </Pressable>}
   />}
  />
  <View style={s.nav}>{[["radar","◉","Radar"],["live","●","En vivo"],["players","♙","Jugadores"],["history","◷","Historial"]].map(x=><Pressable key={x[0]} onPress={()=>setTab(x[0] as any)} style={s.navI}><Text style={[s.navIcon,tab===x[0]&&{color:C.accent}]}>{x[1]}</Text><Text style={[s.navT,tab===x[0]&&{color:C.accent}]}>{x[2]}</Text></Pressable>)}</View>
  {selected&&<Detail match={selected} close={()=>setSelected(null)}/>}
 </SafeAreaView>
}
function Detail({match,close}:{match:any;close:()=>void}){
 const[c,setC]=useState<any>(null),[ev,setE]=useState<any[]>([]);
 useEffect(()=>{Promise.all([context(match.id).catch(()=>null),events(match.id).catch(()=>[])]).then(([a,b])=>{setC(a);setE(b)})},[match.id]);
 return <View style={s.overlay}><View style={s.modal}><Pressable onPress={close}><Text style={s.close}>×</Text></Pressable><Text style={s.kicker}>DETALLE REAL</Text><Text style={s.modalT}>{safeName(match.homeTeam,"Local")} vs {safeName(match.awayTeam,"Visitante")}</Text><Text style={s.big}>{match.homeScore??"-"} — {match.awayScore??"-"}</Text><Text style={s.muted}>{fmt(match.kickoffAt)} · {match.status}</Text>{c?<Text style={s.body}>Forma local: {c.home?.form||"—"} · visitante: {c.away?.form||"—"}</Text>:<Text style={s.muted}>Contexto avanzado no disponible para esta fuente o nivel de acceso.</Text>}<Text style={s.section}>Eventos</Text>{ev.length?ev.slice(0,10).map((x,i)=><Text style={s.body} key={i}>{x.minute??x.time??"—"}' · {x.type??x.detail??"Evento"} {x.player?.name||""}</Text>):<Text style={s.muted}>No hay eventos disponibles para este partido.</Text>}</View></View>
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:C.bg},header:{padding:16,flexDirection:"row",justifyContent:"space-between",alignItems:"center"},brand:{fontSize:28,fontWeight:"900",letterSpacing:3,color:C.text},sub:{fontSize:10,letterSpacing:2,color:C.muted},live:{color:C.accent,fontWeight:"900",fontSize:11},chips:{maxHeight:54},chip:{borderWidth:1,borderColor:C.line,borderRadius:18,paddingHorizontal:13,paddingVertical:9},on:{backgroundColor:C.accent,borderColor:C.accent},chipT:{color:C.muted,fontSize:12},onT:{color:"#04100a",fontWeight:"800"},list:{padding:14,paddingBottom:100},kicker:{color:C.accent,fontSize:11,fontWeight:"900",letterSpacing:1.2},title:{color:C.text,fontSize:25,fontWeight:"900",marginTop:4},muted:{color:C.muted,fontSize:12,lineHeight:18},signal:{backgroundColor:C.card,borderRadius:18,padding:18,borderWidth:1,borderColor:C.line,marginTop:12},sigTitle:{color:C.text,fontSize:21,fontWeight:"900",marginVertical:5},section:{color:C.text,fontWeight:"900",fontSize:16,marginTop:18,marginBottom:9},row:{backgroundColor:C.card,borderRadius:14,padding:14,marginBottom:8,flexDirection:"row",justifyContent:"space-between",borderWidth:1,borderColor:C.line},rowT:{color:C.text,fontWeight:"800"},metric:{color:C.accent,fontWeight:"900",fontSize:18},match:{backgroundColor:C.card,borderRadius:15,padding:14,marginBottom:9,borderWidth:1,borderColor:C.line},status:{color:C.accent,fontSize:10,fontWeight:"900",marginBottom:7},team:{color:C.text,fontSize:15,fontWeight:"700",paddingVertical:3},score:{fontWeight:"900",fontSize:16},nav:{position:"absolute",bottom:0,left:0,right:0,height:72,backgroundColor:"#091827",borderTopWidth:1,borderTopColor:C.line,flexDirection:"row",justifyContent:"space-around",paddingTop:8},navI:{alignItems:"center",minWidth:80},navIcon:{fontSize:20,color:C.muted},navT:{fontSize:11,color:C.muted,marginTop:3},center:{flex:1,alignItems:"center",justifyContent:"center",gap:12},err:{margin:14,padding:14,borderRadius:14,backgroundColor:"#25121a",borderWidth:1,borderColor:"#5a2632"},errT:{color:C.red,fontWeight:"900",marginBottom:4},retry:{color:C.accent,fontWeight:"900",marginTop:10},overlay:{position:"absolute",top:0,bottom:0,left:0,right:0,backgroundColor:"rgba(0,0,0,.72)",justifyContent:"flex-end"},modal:{backgroundColor:C.card,padding:20,borderTopLeftRadius:24,borderTopRightRadius:24,minHeight:330},close:{alignSelf:"flex-end",fontSize:34,color:C.muted},modalT:{fontSize:20,color:C.text,fontWeight:"900",marginTop:4},big:{fontSize:32,color:C.accent,fontWeight:"900",marginVertical:10},body:{color:C.text,fontSize:12,lineHeight:20}});
