"use strict";
const fs=require("node:fs"),path=require("node:path"),{spawnSync}=require("node:child_process");
const root=path.resolve(__dirname,".."),data=path.resolve(root,"../local-data");
if(fs.existsSync(path.join(data,"project.json")))throw Error("Existing project; refusing overwrite");
fs.mkdirSync(path.join(data,"media"),{recursive:true});
const src=process.argv[2];
if(!src||!fs.existsSync(src))throw Error("Supply a local source video");
const r=spawnSync("ffmpeg",["-v","error","-ss","7","-i",src,"-t","4","-vf","scale=720:1280","-c:v","libx264","-preset","fast","-crf","20","-c:a","aac","-y",path.join(data,"media","depth-source.mp4")],{stdio:"inherit",windowsHide:true});
if(r.status!==0)throw Error("Fixture transcode failed");
const text=(id,txt,start,duration,props={},keyframes={})=>({id,name:txt,kind:"text",mediaId:null,track:"V3",start,in:0,duration,props:{text:txt,font:"Arial",fontSize:100,color:"#f3eee5",textShadow:0,...props},keyframes});
const doc={name:"Motion Captions — M0",width:1080,height:1920,fps:30,revision:1,panSchema:1,background:"#171b20",
tracks:[{id:"V4",kind:"video"},{id:"V3",kind:"video"},{id:"V2",kind:"video"},{id:"V1",kind:"video"},{id:"A1",kind:"audio"}],
markers:[{t:0,label:"Mixed typography"},{t:4,label:"Text on path"},{t:8,label:"Person cut-out — source already captioned"}],
media:[{id:"source",name:"Local depth test",kind:"video",src:"/media/depth-source.mp4",duration:4,width:720,height:1280}],
clips:[
text("a","Twoje",0,4,{font:"Georgia",italic:true,fontSize:115,y:-220,textAnim:"rise-mask"}),
text("b","SŁOWA",0.4,3.6,{fontSize:170,weight:900,y:-50,color:"#e5bc70",textAnim:"zoom-in"}),
text("c","w ruchu.",0.8,3.2,{font:"Georgia",italic:true,fontSize:105,y:130,textAnim:"word-slide"}),
text("label1","01 / EDYTOWALNA TYPOGRAFIA",0,4,{fontSize:28,y:700,color:"#a9b1b9"}),
text("path","TEKST PODĄŻA PO KRZYWEJ • ",4,4,{fontSize:55,textPath:{type:"ellipse",w:690,h:690},pathAlign:"start"}, {pathOffset:[{t:0,v:0},{t:4,v:75,ease:"linear"}]}),
text("center","Motion",4,4,{font:"Georgia",italic:true,fontSize:115}),
text("label2","02 / EDYTOWALNA ŚCIEŻKA",4,4,{fontSize:28,y:700,color:"#a9b1b9"}),
{id:"video",name:"Original",mediaId:"source",kind:"video",track:"V1",start:8,in:0,duration:4,props:{fit:"cover",volume:1}},
{...text("behind","ZA TOBĄ",8,4,{fontSize:160,weight:900,y:-430,color:"#e5bc70",textAnim:"zoom-in"}),track:"V2"},
{id:"person",name:"Person foreground — MediaPipe",mediaId:"source",kind:"video",track:"V3",start:8,in:0,duration:4,props:{fit:"cover",volume:0,bgRemove:true}},
{...text("label3","03 / TEST MASKI POSTACI",8,4,{fontSize:28,y:700,bgColor:"#171b20",bgOpacity:0.8}),track:"V4"}
]};
fs.writeFileSync(path.join(data,"project.json"),JSON.stringify(doc,null,2));
console.log("Prepared "+data);
