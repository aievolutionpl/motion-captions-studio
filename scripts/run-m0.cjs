"use strict";
const fs=require("node:fs"),path=require("node:path");
const {startMcp}=require("../test/helpers.js");
const clean=[];const data=path.resolve(__dirname,"../../local-data");
(async()=>{const m=startMcp({after:fn=>clean.push(fn)},data,{FABLECUT_PORT:"7788",FABLECUT_NO_AUTOSTART:"1"});
try {
 const call=async(name,args)=>{const r=await m.request("tools/call",{name,arguments:args},{timeout:60000});if(r.error||r.result?.isError)throw Error(JSON.stringify(r));return r.result;};
 const p=await call("fablecut_get_project",{compact:true});console.log(JSON.stringify(p));
 const initial=JSON.parse(fs.readFileSync(path.join(data,"project.json")));
 await call("fablecut_patch_project",{baseRevision:initial.revision,ops:[{op:"updateClip",id:"a",set:{props:{color:"#ffffff"}}}]});
 const edited=JSON.parse(fs.readFileSync(path.join(data,"project.json")));
 if(edited.revision<=initial.revision)throw Error("Revision did not increase");
 const rejected=await m.request("tools/call",{name:"fablecut_patch_project",arguments:{baseRevision:initial.revision,ops:[{op:"updateClip",id:"a",set:{props:{text:"STALE"}}}]}});
 if(!rejected.result?.isError)throw Error("Stale edit was accepted");
 console.log("MCP edit and stale revision rejection passed");
 const result=await call("fablecut_export",{where:"headless",wait:false,range:"entire",preset:"master"});
 console.log(JSON.stringify(result));
 fs.writeFileSync(path.join(data,"export-request.json"),JSON.stringify(result,null,2));
}finally{for(const f of clean)await f();}})().catch(e=>{console.error(e);process.exitCode=1;});
