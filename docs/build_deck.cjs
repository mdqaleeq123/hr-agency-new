const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "HR Agency: 8 Autonomous AI Employees";
const NAVY="12263F", TEAL="1B998B", CORAL="E4572E", LIGHT="F4F7FA", INK="1B2733", MUTE="5B6B7B";
const H="Cambria", B="Calibri";
let n=0;
function slide(title, dark){
  const s=pres.addSlide(); n++;
  s.background={color: dark?NAVY:"FFFFFF"};
  if(title) s.addText(title,{x:0.6,y:0.35,w:8.8,h:0.8,fontFace:H,fontSize:34,bold:true,color:dark?"FFFFFF":NAVY,margin:0,isTextBox:true});
  s.addText(String(n),{x:9.0,y:5.2,w:0.5,h:0.3,fontFace:B,fontSize:10,color:dark?"9FB3C8":MUTE,align:"right",margin:0,isTextBox:true});
  return s;
}
// 1 title
let s=slide(null,true);
s.addText("HR Agency",{x:0.6,y:1.4,w:8.8,h:1,fontFace:H,fontSize:54,bold:true,color:"FFFFFF",margin:0,isTextBox:true});
s.addText("Eight autonomous AI employees for sourcing, resume parsing, onboarding and pipeline management",{x:0.6,y:2.5,w:7.5,h:0.9,fontFace:B,fontSize:20,color:"CADCFC",margin:0,isTextBox:true});
s.addText("Abdul Qaleeq Mohammed  |  Course assignment: Design & Deploy an Autonomous AI Agency",{x:0.6,y:4.6,w:8.8,h:0.4,fontFace:B,fontSize:14,color:"9FB3C8",margin:0,isTextBox:true});

// 2 objective & why HR
s=slide("The goal and why HR");
const stats=[["8","AI employees, one team"],["1","Project Manager auditing the other 7"],["4","Ledger columns logged every run"],["1","Daily email brief"]];
stats.forEach((t,i)=>{const x=0.6+i*2.25;
 s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y:1.5,w:2.05,h:1.7,fill:{color:LIGHT},rectRadius:0.1,objectName:"stat card "+(i+1)});
 s.addText(t[0],{x,y:1.6,w:2.05,h:0.9,align:"center",fontFace:H,fontSize:48,bold:true,color:TEAL,margin:0,isTextBox:true});
 s.addText(t[1],{x:x+0.1,y:2.45,w:1.85,h:0.7,align:"center",fontFace:B,fontSize:14,color:INK,margin:0,isTextBox:true});});
s.addText([{text:"HR work is repetitive and rule-based: ",options:{bold:true}},{text:"read a resume, match it to a role, move a candidate to the next stage, build a checklist for a new hire. It is ideal for specialised agents, as long as a human keeps the final say on anything sent to a candidate."}],{x:0.6,y:3.6,w:8.8,h:1.2,fontFace:B,fontSize:16,color:INK,margin:0,isTextBox:true});

// 3 team
s=slide("The 8-employee team");
const team=[["Project Manager","Audits all agents, logs the Sheet, emails the brief"],["Talent Sourcer","Boolean search plans per open role"],["Resume Parser","Turns resumes into structured candidate data"],["JD & Outreach Writer","Inclusive JDs and held outreach drafts"],["Pipeline Manager","Scores candidates and sets pipeline stages"],["Onboarding Coordinator","30/60/90 day tracks for new hires"],["HR Analyst","Funnel metrics and bottleneck flags"],["Compliance Auditor","Data mismatches, invalid emails, biased wording"]];
team.forEach((t,i)=>{const c=i%4,r=Math.floor(i/4),x=0.6+c*2.25,y=1.4+r*1.85;
 s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y,w:2.05,h:1.65,fill:{color:i==0?NAVY:LIGHT},rectRadius:0.1,objectName:"role card "+(i+1)});
 s.addShape(pres.shapes.OVAL,{x:x+0.15,y:y+0.15,w:0.4,h:0.4,fill:{color:i==0?CORAL:TEAL},objectName:"badge "+(i+1)});
 s.addText(String(i+1),{x:x+0.15,y:y+0.15,w:0.4,h:0.4,align:"center",valign:"middle",fontFace:B,fontSize:14,bold:true,color:"FFFFFF",margin:0,isTextBox:true});
 s.addText(t[0],{x:x+0.15,y:y+0.6,w:1.8,h:0.35,fontFace:B,fontSize:14,bold:true,color:i==0?"FFFFFF":NAVY,margin:0,isTextBox:true});
 s.addText(t[1],{x:x+0.15,y:y+0.95,w:1.8,h:0.65,fontFace:B,fontSize:11,color:i==0?"CADCFC":MUTE,margin:0,isTextBox:true});});

// 4 architecture
s=slide("Architecture");
const boxes=[["Employee kits","ROLE.md + routines/SKILL.md"],["scripts/agents.mjs","each agent does its task"],["data/out/","files each agent creates"],["runlog.jsonl","one safe line per run"]];
boxes.forEach((b,i)=>{const x=0.6+i*2.3;
 s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y:1.5,w:2.0,h:1.2,fill:{color:LIGHT},rectRadius:0.1,objectName:"flow "+(i+1)});
 s.addText([{text:b[0],options:{bold:true,breakLine:true,color:NAVY,fontSize:14}},{text:b[1],options:{color:MUTE,fontSize:11}}],{x:x+0.1,y:1.55,w:1.8,h:1.1,align:"center",valign:"middle",fontFace:B,margin:0,isTextBox:true});
 if(i<3) s.addText("→",{x:x+2.0,y:1.85,w:0.3,h:0.5,align:"center",fontFace:B,fontSize:22,color:TEAL,margin:0,isTextBox:true});});
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.6,y:3.1,w:4.2,h:1.5,fill:{color:NAVY},rectRadius:0.1,objectName:"sheet card"});
s.addText([{text:"Google Sheet ledger",options:{bold:true,breakLine:true,fontSize:16}},{text:"sheet_bridge.mjs posts to an Apps Script web app. Columns: Timestamp | Agent Name | Task Performed | Output Status. Failed posts queue locally.",options:{fontSize:12,color:"CADCFC"}}],{x:0.8,y:3.2,w:3.8,h:1.3,fontFace:B,color:"FFFFFF",margin:0,valign:"middle",isTextBox:true});
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:5.2,y:3.1,w:4.2,h:1.5,fill:{color:TEAL},rectRadius:0.1,objectName:"email card"});
s.addText([{text:"Daily email brief",options:{bold:true,breakLine:true,fontSize:16}},{text:"daily_brief.mjs builds a scannable bulletin; Apps Script MailApp delivers it to your inbox. A time trigger sends it even if the laptop is off.",options:{fontSize:12}}],{x:5.4,y:3.2,w:3.8,h:1.3,fontFace:B,color:"FFFFFF",margin:0,valign:"middle",isTextBox:true});

// 5 project manager
s=slide("The Project Manager at work");
const steps=[["Audit","Reads the run log and checks that all 7 agents reported today"],["Log","Appends one row per agent to the Google Sheet ledger"],["Brief","Writes a short bulletin: needs attention first, then status per agent"],["Email","Sends the brief to your inbox every weekday"]];
steps.forEach((t,i)=>{const y=1.4+i*0.95;
 s.addShape(pres.shapes.OVAL,{x:0.6,y,w:0.6,h:0.6,fill:{color:i==0?CORAL:TEAL},objectName:"step "+(i+1)});
 s.addText(String(i+1),{x:0.6,y,w:0.6,h:0.6,align:"center",valign:"middle",fontFace:B,fontSize:18,bold:true,color:"FFFFFF",margin:0,isTextBox:true});
 s.addText([{text:t[0]+"  ",options:{bold:true,color:NAVY}},{text:t[1],options:{color:INK}}],{x:1.5,y,w:4.4,h:0.6,valign:"middle",fontFace:B,fontSize:15,margin:0,isTextBox:true});});
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:6.2,y:1.4,w:3.2,h:3.6,fill:{color:LIGHT},rectRadius:0.1,objectName:"brief sample"});
s.addText([{text:"Sample brief",options:{bold:true,color:NAVY,fontSize:14,breakLine:true}},{text:"Agents reported: 7/8",options:{fontSize:12,breakLine:true}},{text:"NEEDS ATTENTION",options:{bold:true,color:CORAL,fontSize:12,breakLine:true}},{text:"[PARTIAL] compliance-auditor: found 3 issues for review",options:{fontSize:12,breakLine:true}},{text:" ",options:{fontSize:6,breakLine:true}},{text:"talent-sourcer  OK",options:{fontSize:12,breakLine:true}},{text:"resume-parser  OK",options:{fontSize:12,breakLine:true}},{text:"pipeline-manager  OK",options:{fontSize:12,breakLine:true}},{text:"hr-analyst  OK",options:{fontSize:12}}],{x:6.4,y:1.55,w:2.8,h:3.3,fontFace:"Courier New",color:INK,margin:0,valign:"top",isTextBox:true});

// 6 setup
s=slide("Step-by-step setup");
const setup=[["Get the kit format","Cloned markfulton/ai-employees and followed its ROLE / SCHEDULE / SKILL layout"],["Write 8 HR employees","One folder each, with a ROLE.md and a scheduled routine"],["Build the bridges","Run logger, Sheet bridge, email brief and run_all orchestrator"],["Connect Google","Paste Apps Script, run setup(), deploy as web app"],["Run and verify","Selftest, run_all, check Sheet rows and inbox email"]];
setup.forEach((t,i)=>{const y=1.3+i*0.76;
 s.addText(String(i+1),{x:0.6,y,w:0.5,h:0.6,fontFace:H,fontSize:30,bold:true,color:TEAL,margin:0,valign:"middle",isTextBox:true});
 s.addText([{text:t[0],options:{bold:true,color:NAVY,breakLine:true,fontSize:16}},{text:t[1],options:{color:MUTE,fontSize:13}}],{x:1.3,y,w:8,h:0.65,fontFace:B,margin:0,valign:"middle",isTextBox:true});});

// 7 guardrails
s=slide("Guardrails built in");
const g=[["Held outreach","Drafts are written, never sent. A human releases them."],["No secrets in logs","The logger rejects any record with an email, phone, URL or key."],["Sample data only","Candidate files are fictional and stay on the machine."],["Owner-only email","The email bridge can only send to the Sheet owner."]];
g.forEach((t,i)=>{const c=i%2,r=Math.floor(i/2),x=0.6+c*4.5,y=1.4+r*1.75;
 s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y,w:4.2,h:1.55,fill:{color:LIGHT},rectRadius:0.1,objectName:"guardrail "+(i+1)});
 s.addText([{text:t[0],options:{bold:true,color:NAVY,fontSize:18,breakLine:true}},{text:t[1],options:{color:INK,fontSize:14}}],{x:x+0.25,y:y+0.1,w:3.7,h:1.35,fontFace:B,margin:0,valign:"middle",isTextBox:true});});

// 8 outcomes chart
s=slide("Results of the first run");
s.addChart(pres.charts.BAR,[{name:"Candidates",labels:["Shortlisted","Screening","Talent pool"],values:[2,1,1]}],{x:0.6,y:1.3,w:4.8,h:3.6,barDir:"col",chartColors:[TEAL],showValue:true,dataLabelPosition:"outEnd",dataLabelColor:INK,dataLabelFontFace:"Calibri",dataLabelFontSize:12,showLegend:false,showTitle:true,title:"Candidates by pipeline stage",titleFontFace:"Calibri",titleFontSize:14,titleColor:NAVY,catAxisLabelColor:MUTE,valAxisLabelColor:MUTE,catAxisLabelFontFace:"Calibri",valAxisLabelFontFace:"Calibri",valGridLine:{color:"E3E8ED",size:0.5},catGridLine:{style:"none"},valAxisMaxVal:3,valAxisMajorUnit:1});
const out=[["4","resumes parsed"],["2","JDs and 4 held outreach drafts"],["3","data issues caught by the auditor"],["1","bottleneck flagged: widen sourcing"]];
out.forEach((t,i)=>{const y=1.3+i*0.92;
 s.addText(t[0],{x:5.8,y,w:0.9,h:0.8,fontFace:H,fontSize:38,bold:true,color:i==2?CORAL:TEAL,margin:0,valign:"middle",isTextBox:true});
 s.addText(t[1],{x:6.8,y,w:2.7,h:0.8,fontFace:B,fontSize:15,color:INK,margin:0,valign:"middle",isTextBox:true});});

// 9 lessons / next
s=slide("Lessons and next steps");
s.addText([{text:"What worked",options:{bold:true,color:NAVY,fontSize:20,breakLine:true}},{text:"Clear role boundaries: each agent writes only its own files",options:{bullet:true,breakLine:true}},{text:"A manager agent makes silent failures visible",options:{bullet:true,breakLine:true}},{text:"Queueing failed Sheet posts avoids lost rows",options:{bullet:true}}],{x:0.6,y:1.4,w:4.2,h:3.4,fontFace:B,fontSize:15,color:INK,margin:0,valign:"top",paraSpaceAfter:8,isTextBox:true});
s.addText([{text:"Next",options:{bold:true,color:NAVY,fontSize:20,breakLine:true}},{text:"Connect a real ATS or job board feed",options:{bullet:true,breakLine:true}},{text:"Schedule weekday runs with cron or Claude Code",options:{bullet:true,breakLine:true}},{text:"Add interview scheduling for the shortlist",options:{bullet:true}}],{x:5.2,y:1.4,w:4.2,h:3.4,fontFace:B,fontSize:15,color:INK,margin:0,valign:"top",paraSpaceAfter:8,isTextBox:true});

// 10 close
s=slide(null,true);
s.addText("Thank you",{x:0.6,y:1.7,w:8.8,h:1,fontFace:H,fontSize:48,bold:true,color:"FFFFFF",margin:0,isTextBox:true});
s.addText("Repo: github.com/<your-username>/hr-agency\nSheet: HR Agency Ledger",{x:0.6,y:2.9,w:8.8,h:1,fontFace:B,fontSize:18,color:"CADCFC",margin:0,isTextBox:true});
pres.writeFile({fileName:"HR_Agency_Presentation.pptx"}).then(()=>console.log("done"));
