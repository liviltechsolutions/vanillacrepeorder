import { useState, useMemo, useRef, useEffect } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const HOURS=[];
for(let h=9;h<=19;h++){HOURS.push(`${String(h).padStart(2,"0")}:00`);if(h<19)HOURS.push(`${String(h).padStart(2,"0")}:30`);}
const DAY_NAMES=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS_EN=["January","February","March","April","May","June","July","August","September","October","November","December"];
const ALL_SERVICES=[
  {id:1,name:"Haircut & Blowdry",duration:60,price:80},
  {id:2,name:"Full Colour",duration:120,price:180},
  {id:3,name:"Deep Treatment",duration:90,price:120},
  {id:4,name:"Manicure",duration:45,price:50},
  {id:5,name:"Facial (Basic)",duration:60,price:100},
  {id:6,name:"Eyebrow Threading",duration:30,price:30},
];
const PAY_METHODS=["fpx","tng","grabpay","duitnow","card","cash","boost"];
const PAY_ICONS={fpx:"🏦",tng:"💚",grabpay:"🟢",duitnow:"🔵",card:"💳",cash:"💵",boost:"⚡"};
const PC={paid:{bg:"#f0fdf4",br:"#86efac",tx:"#15803d"},unpaid:{bg:"#fef2f2",br:"#fca5a5",tx:"#991b1b"},partial:{bg:"#fffbeb",br:"#fcd34d",tx:"#92400e"}};
const BC={confirmed:{bg:"#f0fdf4",br:"#86efac",tx:"#15803d"},pending:{bg:"#fffbeb",br:"#fcd34d",tx:"#92400e"},cancelled:{bg:"#fef2f2",br:"#fca5a5",tx:"#991b1b"},unassigned:{bg:"#fdf4ff",br:"#e9d5ff",tx:"#7e22ce"}};
const POSITIONS=["Junior Beautician","Senior Beautician","Lead Stylist","Nail Technician","Therapist","Manager","Freelancer"];
const SKILL_OPTIONS=["Haircut","Colouring","Treatment","Manicure","Pedicure","Facial","Threading","Massage","Makeup","Lash Extension"];
const SEATS=["Seat A1","Seat A2","Seat B1","Seat B2","Room 1","Room 2","Room 3","VIP Room"];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmtD=ds=>new Date(ds+"T00:00:00").toLocaleDateString("en-MY",{day:"numeric",month:"short"});
const fmtDFull=ds=>new Date(ds+"T00:00:00").toLocaleDateString("en-MY",{weekday:"short",day:"numeric",month:"short"});
const timeToMin=t=>{const[h,m]=t.split(":").map(Number);return h*60+m;};
const nowStr=()=>new Date().toLocaleString("en-MY",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
const getDIM=(y,m)=>new Date(y,m+1,0).getDate();
const getFD=(y,m)=>new Date(y,m,1).getDay();
const TODAY="2026-06-22";
function getWkDates(base){const d=new Date(base);const dy=d.getDay();const out=[];for(let i=0;i<7;i++){const n=new Date(d);n.setDate(d.getDate()-dy+i);out.push(n.toISOString().split("T")[0]);}return out;}
function dateRange(from,to){const out=[];const cur=new Date(from+"T00:00:00");const end=new Date(to+"T00:00:00");while(cur<=end){out.push(cur.toISOString().split("T")[0]);cur.setDate(cur.getDate()+1);}return out;}
function isUpcoming(date){return date>=TODAY;}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const card=(e={})=>({background:"#fff",borderRadius:12,border:"1px solid #ede9fe",boxShadow:"0 1px 4px rgba(124,58,237,0.05)",...e});
const pBtn=(e={})=>({background:"linear-gradient(135deg,#7e22ce,#a855f7)",color:"#fff",border:"none",borderRadius:8,padding:"9px 16px",cursor:"pointer",fontSize:13,fontWeight:600,...e});
const gBtn=(e={})=>({border:"1px solid #ede9fe",background:"#fff",borderRadius:8,padding:"7px 14px",cursor:"pointer",fontSize:12,color:"#7e22ce",fontWeight:600,...e});
const inp={width:"100%",padding:"9px 11px",border:"1px solid #ede9fe",borderRadius:8,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit"};
const lbl={fontSize:11,fontWeight:600,color:"#4a4a6a",display:"block",marginBottom:5};

// ─── ADD BOOKING MODAL ───────────────────────────────────────────────────────
function AddModal({show,onClose,onAdd,initialDate,initialTime,leaveRecords,staffList}){
  const [f,setF]=useState({customer:"",phone:"",service:1,staff:1,date:initialDate||TODAY,time:initialTime||"09:00",remark:"",payStatus:"unpaid",payMethod:"",amtPaid:0,txnId:"",seat:""});
  useMemo(()=>{if(show)setF(p=>({...p,date:initialDate||TODAY,time:initialTime||"09:00"}));},[show,initialDate,initialTime]);
  if(!show) return null;
  const up=(k,v)=>setF(p=>({...p,[k]:v}));
  const isOL=(sid)=>leaveRecords.some(r=>r.dates.includes(f.date)&&r.staffId===sid);
  const avail=staffList.filter(s=>!isOL(s.id));
  const price=ALL_SERVICES.find(s=>s.id===f.service)?.price||0;
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:12}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:16,padding:20,width:460,maxWidth:"100%",maxHeight:"93vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.25)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontWeight:700,fontSize:15,color:"#1a1a2e"}}>➕ Add Booking</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9090b0",padding:"0 4px"}}>×</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            <div><label style={lbl}>Customer Name</label><input value={f.customer} onChange={e=>up("customer",e.target.value)} placeholder="e.g. Sarah Lim" style={inp}/></div>
            <div><label style={lbl}>Phone</label><input value={f.phone} onChange={e=>up("phone",e.target.value)} placeholder="012-3456789" style={inp}/></div>
          </div>
          <div><label style={lbl}>Service</label>
            <select value={f.service} onChange={e=>up("service",Number(e.target.value))} style={inp}>
              {ALL_SERVICES.map(s=><option key={s.id} value={s.id}>{s.name} — RM{s.price} ({s.duration}min)</option>)}
            </select>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            <div><label style={lbl}>Staff</label>
              {avail.length===0
                ?<div style={{...inp,background:"#fef2f2",color:"#991b1b",fontSize:12}}>⚠️ All staff on leave</div>
                :<select value={avail.find(s=>s.id===f.staff)?f.staff:avail[0]?.id} onChange={e=>up("staff",Number(e.target.value))} style={inp}>
                  {avail.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              }
            </div>
            <div><label style={lbl}>Seat / Room</label>
              <select value={f.seat} onChange={e=>up("seat",e.target.value)} style={inp}>
                <option value="">— Not assigned —</option>
                {SEATS.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            <div><label style={lbl}>Date</label><input type="date" value={f.date} onChange={e=>up("date",e.target.value)} style={inp}/></div>
            <div><label style={lbl}>Time</label><select value={f.time} onChange={e=>up("time",e.target.value)} style={inp}>{HOURS.map(h=><option key={h} value={h}>{h}</option>)}</select></div>
          </div>
          <div><label style={lbl}>💬 Special Request / Remark</label><input value={f.remark} onChange={e=>up("remark",e.target.value)} placeholder="e.g. no heat, prefer gentle products" style={inp}/></div>
          <div style={{background:"#f8f7ff",borderRadius:9,padding:"11px 13px"}}>
            <div style={{fontSize:10,fontWeight:700,color:"#7e22ce",marginBottom:7}}>💳 Payment</div>
            <div style={{display:"flex",gap:5,marginBottom:8}}>
              {["paid","unpaid","partial"].map(ps=>{const pc=PC[ps];const sel=f.payStatus===ps;return(
                <button key={ps} onClick={()=>up("payStatus",ps)} style={{flex:1,padding:"6px 2px",borderRadius:6,border:sel?`2px solid ${pc.br}`:"1px solid #ede9fe",background:sel?pc.bg:"#fff",color:sel?pc.tx:"#9090b0",fontWeight:sel?700:400,fontSize:10,cursor:"pointer"}}>{ps==="paid"?"Paid ✓":ps==="unpaid"?"Unpaid":"Partial"}</button>
              );})}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:7}}>
              <div><label style={lbl}>Method</label>
                <select value={f.payMethod} onChange={e=>up("payMethod",e.target.value)} style={inp}>
                  <option value="">Select...</option>
                  {PAY_METHODS.map(k=><option key={k} value={k}>{PAY_ICONS[k]} {k.toUpperCase()}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Amount Paid (RM)</label><input type="number" min={0} max={price} value={f.amtPaid} onChange={e=>up("amtPaid",Number(e.target.value))} style={inp}/></div>
            </div>
            {price>0&&<div style={{display:"flex",justifyContent:"space-between",padding:"6px 9px",background:"#fff",borderRadius:6,border:"1px solid #ede9fe",fontSize:10,marginBottom:7}}>
              <span>Total: <strong>RM {price}</strong></span>
              <span style={{color:f.amtPaid>=price?"#15803d":"#991b1b",fontWeight:600}}>Balance: RM {Math.max(0,price-f.amtPaid)}</span>
            </div>}
            <div><label style={lbl}>Transaction No.</label><input value={f.txnId} onChange={e=>up("txnId",e.target.value)} placeholder="TXN..." style={inp}/></div>
          </div>
          <button onClick={()=>{if(!f.customer||!f.phone)return;onAdd(f);}} style={pBtn({padding:"11px 0",fontSize:13,width:"100%",marginTop:2})}>Add Booking</button>
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL / EDIT MODAL ─────────────────────────────────────────────────────
function DetailModal({booking,onClose,onAccept,onCancel,onSave,leaveRecords,staffList,autoEdit}){
  const [edit,setEdit]=useState(false);
  const [draft,setDraft]=useState(null);
  if(!booking) return null;
  const b=booking;
  const sc=BC[b.status]||BC.confirmed;
  const pc=PC[b.payStatus]||PC.unpaid;
  const sv=ALL_SERVICES.find(s=>s.id===b.service);
  const st=staffList.find(s=>s.id===b.staff);
  const price=sv?.price||0;
  const balance=Math.max(0,price-(b.amtPaid||0));
  const isOL=(sid,date)=>leaveRecords.some(r=>r.dates.includes(date)&&r.staffId===sid);
  const avail=draft?staffList.filter(s=>!isOL(s.id,draft.date)||s.id===b.staff):staffList;
  const nowDraft=draft||{};
  const dPrice=ALL_SERVICES.find(s=>s.id===nowDraft.service)?.price||0;
  const dBal=Math.max(0,dPrice-(nowDraft.amtPaid||0));

  const openEdit=()=>{setDraft({date:b.date,time:b.time,service:b.service,staff:b.staff,remark:b.remark||"",payStatus:b.payStatus,payMethod:b.payMethod||"",amtPaid:b.amtPaid||0,txnId:b.txnId||"",seat:b.seat||""});setEdit(true);};
  const saveEdit=()=>{onSave(b,draft);setEdit(false);};
  // If triggered from notification, open edit mode immediately
  if(autoEdit&&!edit&&!draft&&b.status!=="cancelled"){openEdit();}

  return(
    <div onClick={()=>{onClose();setEdit(false);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:12}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:16,width:460,maxWidth:"100%",maxHeight:"93vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.25)"}}>
        <div style={{padding:"13px 18px 10px",borderBottom:"1px solid #f0ebff",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:"#fff",zIndex:1,borderRadius:"16px 16px 0 0"}}>
          <div><div style={{fontWeight:700,fontSize:14,color:"#1a1a2e"}}>Booking Details</div><div style={{fontSize:9,color:"#9090b0"}}>#{String(b.id).padStart(5,"0")}</div></div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {!edit&&b.status!=="cancelled"&&<button onClick={openEdit} style={gBtn({fontSize:10,padding:"5px 9px"})}>✏️ Edit</button>}
            <button onClick={()=>{onClose();setEdit(false);}} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9090b0",padding:"0 4px"}}>×</button>
          </div>
        </div>
        <div style={{padding:"12px 18px"}}>
          {/* Customer pill */}
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"#f8f7ff",borderRadius:10,marginBottom:11}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#9333ea,#c084fc)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:14,flexShrink:0}}>{b.customer[0]}</div>
            <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13,color:"#1a1a2e"}}>{b.customer}</div><div style={{fontSize:10,color:"#9090b0"}}>{b.phone}</div></div>
            <span style={{padding:"2px 8px",borderRadius:20,fontSize:9,fontWeight:600,background:sc.bg,color:sc.tx,border:`1px solid ${sc.br}`}}>{b.status}</span>
          </div>
          {/* Pay banner */}
          <div style={{padding:"9px 12px",background:pc.bg,border:`1px solid ${pc.br}`,borderRadius:10,marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
              <span style={{fontSize:15}}>{b.payStatus==="paid"?"✅":b.payStatus==="partial"?"⚠️":"❌"}</span>
              <div style={{flex:1}}><div style={{fontWeight:700,fontSize:11,color:pc.tx}}>{b.payStatus==="paid"?"Payment Successful":"Payment Pending"} — {b.payStatus}</div>{b.payMethod&&<div style={{fontSize:10,color:pc.tx,opacity:.8}}>{PAY_ICONS[b.payMethod]} {b.payMethod.toUpperCase()}</div>}{b.txnId&&<div style={{fontSize:9,color:pc.tx,opacity:.7,fontFamily:"monospace"}}>{b.txnId}</div>}</div>
              <div style={{fontWeight:700,fontSize:13,color:pc.tx}}>RM {price}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
              <div style={{background:"rgba(255,255,255,0.7)",borderRadius:6,padding:"5px 8px"}}><div style={{fontSize:8,color:pc.tx,opacity:.7}}>Amount Paid</div><div style={{fontSize:13,fontWeight:700,color:"#15803d"}}>RM {b.amtPaid||0}</div></div>
              <div style={{background:"rgba(255,255,255,0.7)",borderRadius:6,padding:"5px 8px"}}><div style={{fontSize:8,color:pc.tx,opacity:.7}}>{balance===0?"Fully Paid":"Remaining Balance"}</div><div style={{fontSize:13,fontWeight:700,color:balance===0?"#15803d":"#991b1b"}}>{balance===0?"✓ Paid":`RM ${balance}`}</div></div>
            </div>
          </div>

          {!edit&&<>
            {[[sv?.name,"Service","✂️"],[`${sv?.duration} min`,"Duration","⏱️"],[`${fmtD(b.date)}, ${b.time}`,"Date & Time","📅"],[st?.name||"—","Staff","👩"],[b.seat||"—","Seat / Room","🪑"],[b.payMethod?`${PAY_ICONS[b.payMethod]} ${b.payMethod.toUpperCase()}`:"-","Payment Method","💳"],[b.txnId||"—","Transaction No.","🔖"]].map(([v,l,ic])=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:"1px solid #f5f3ff"}}>
                <span style={{fontSize:12,width:17,textAlign:"center",flexShrink:0}}>{ic}</span>
                <span style={{fontSize:10,color:"#9090b0",width:90,flexShrink:0}}>{l}</span>
                <span style={{fontSize:11,fontWeight:500,color:"#1a1a2e",fontFamily:l==="Transaction No."?"monospace":"inherit"}}>{v}</span>
              </div>
            ))}
            {b.remark&&<div style={{marginTop:8,padding:"7px 9px",background:"#f3e8ff",borderRadius:7,fontSize:10,color:"#7e22ce"}}>💬 <strong>Remark:</strong> {b.remark}</div>}
            {b.note&&<div style={{marginTop:5,padding:"6px 9px",background:"#fffbeb",borderRadius:7,fontSize:10,color:"#92400e"}}>📝 {b.note}</div>}
            {b.status==="unassigned"&&<div style={{marginTop:7,padding:"7px 10px",background:"#fdf4ff",border:"1px solid #e9d5ff",borderRadius:7,fontSize:10,color:"#7e22ce",fontWeight:600}}>⚠️ Staff on leave — please reassign</div>}
            {/* Call / WhatsApp */}
            <div style={{display:"flex",gap:6,marginTop:10}}>
              <a href={`tel:${b.phone}`} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"7px 0",borderRadius:7,background:"#f0fdf4",border:"1px solid #86efac",color:"#15803d",textDecoration:"none",fontSize:11,fontWeight:600}}>📞 Call</a>
              <a href={`https://wa.me/6${b.phone.replace(/-/g,"")}`} target="_blank" rel="noreferrer" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"7px 0",borderRadius:7,background:"#f0fdf4",border:"1px solid #86efac",color:"#15803d",textDecoration:"none",fontSize:11,fontWeight:600}}>💬 WhatsApp</a>
            </div>
            {b.status==="pending"&&<div style={{display:"flex",gap:6,marginTop:8}}><button onClick={()=>onAccept(b.id)} style={pBtn({flex:1,background:"linear-gradient(135deg,#16a34a,#22c55e)",padding:"9px 0",fontSize:11})}>✓ Confirm</button><button onClick={()=>onCancel(b.id)} style={{flex:1,background:"#fef2f2",border:"1px solid #fca5a5",color:"#991b1b",borderRadius:7,padding:"9px 0",cursor:"pointer",fontWeight:700,fontSize:11}}>✕ Cancel</button></div>}
            {(b.status==="confirmed"||b.status==="unassigned")&&<button onClick={()=>onCancel(b.id)} style={{width:"100%",marginTop:8,background:"#fef2f2",border:"1px solid #fca5a5",color:"#991b1b",borderRadius:7,padding:"7px 0",cursor:"pointer",fontWeight:600,fontSize:10}}>Cancel Booking</button>}
          </>}

          {edit&&draft&&<div style={{display:"flex",flexDirection:"column",gap:9}}>
            <div style={{fontWeight:600,fontSize:10,color:"#7e22ce",padding:"5px 9px",background:"#f3e8ff",borderRadius:6}}>✏️ Edit Booking</div>
            <div style={{background:"#f8f7ff",borderRadius:8,padding:"9px 11px"}}>
              <div style={{fontSize:9,fontWeight:700,color:"#7e22ce",marginBottom:6}}>📅 Reschedule</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                <div><label style={lbl}>Date</label><input type="date" value={draft.date} onChange={e=>setDraft(p=>({...p,date:e.target.value}))} style={inp}/></div>
                <div><label style={lbl}>Time</label><select value={draft.time} onChange={e=>setDraft(p=>({...p,time:e.target.value}))} style={inp}>{HOURS.map(h=><option key={h} value={h}>{h}</option>)}</select></div>
              </div>
            </div>
            <div style={{background:"#f8f7ff",borderRadius:8,padding:"9px 11px"}}>
              <div style={{fontSize:9,fontWeight:700,color:"#7e22ce",marginBottom:6}}>✂️ Service & Staff</div>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                <div><label style={lbl}>Service</label><select value={draft.service} onChange={e=>setDraft(p=>({...p,service:Number(e.target.value)}))} style={inp}>{ALL_SERVICES.map(s=><option key={s.id} value={s.id}>{s.name} — RM{s.price}</option>)}</select></div>
                <div><label style={lbl}>Staff</label><select value={draft.staff} onChange={e=>setDraft(p=>({...p,staff:Number(e.target.value)}))} style={inp}>{avail.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                <div><label style={lbl}>🪑 Seat / Room</label><select value={draft.seat||""} onChange={e=>setDraft(p=>({...p,seat:e.target.value}))} style={inp}><option value="">— Not assigned —</option>{SEATS.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
              </div>
            </div>
            <div><label style={lbl}>💬 Remark</label><input value={draft.remark} onChange={e=>setDraft(p=>({...p,remark:e.target.value}))} placeholder="Special request..." style={inp}/></div>
            <div style={{background:"#f8f7ff",borderRadius:8,padding:"9px 11px"}}>
              <div style={{fontSize:9,fontWeight:700,color:"#7e22ce",marginBottom:6}}>💳 Payment</div>
              <div style={{display:"flex",gap:4,marginBottom:7}}>{["paid","unpaid","partial"].map(ps=>{const pc2=PC[ps];const sel=draft.payStatus===ps;return <button key={ps} onClick={()=>setDraft(p=>({...p,payStatus:ps}))} style={{flex:1,padding:"5px 2px",borderRadius:5,border:sel?`2px solid ${pc2.br}`:"1px solid #ede9fe",background:sel?pc2.bg:"#fff",color:sel?pc2.tx:"#9090b0",fontWeight:sel?700:400,fontSize:9,cursor:"pointer"}}>{ps}</button>;})}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:6}}>
                <div><label style={lbl}>Method</label><select value={draft.payMethod} onChange={e=>setDraft(p=>({...p,payMethod:e.target.value}))} style={inp}><option value="">Select...</option>{PAY_METHODS.map(k=><option key={k} value={k}>{PAY_ICONS[k]} {k}</option>)}</select></div>
                <div><label style={lbl}>Amt Paid (RM)</label><input type="number" min={0} value={draft.amtPaid} onChange={e=>setDraft(p=>({...p,amtPaid:Number(e.target.value)}))} style={inp}/></div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"5px 8px",background:"#fff",borderRadius:5,border:"1px solid #ede9fe",fontSize:9,marginBottom:6}}>
                <span>Total: <strong>RM {dPrice}</strong></span>
                <span style={{color:dBal===0?"#15803d":"#991b1b",fontWeight:600}}>Balance: RM {dBal}</span>
              </div>
              <div><label style={lbl}>TXN No.</label><input value={draft.txnId} onChange={e=>setDraft(p=>({...p,txnId:e.target.value}))} placeholder="TXN..." style={inp}/></div>
            </div>
            <div style={{display:"flex",gap:6}}><button onClick={saveEdit} style={pBtn({flex:1,padding:"9px 0",fontSize:11})}>Save Changes</button><button onClick={()=>setEdit(false)} style={gBtn({flex:1,padding:"9px 0",fontSize:11})}>Cancel</button></div>
          </div>}

          {!edit&&b.history?.length>0&&<div style={{marginTop:10,paddingTop:8,borderTop:"1px solid #f0ebff"}}><div style={{fontSize:9,fontWeight:700,color:"#7e22ce",marginBottom:5}}>🕓 Change History</div>{b.history.map((h,i)=><div key={i} style={{fontSize:8,color:"#64648a",padding:"2px 0",borderBottom:"1px solid #f8f6ff"}}><strong>{h.field}</strong>: <span style={{color:"#ef4444"}}>{h.from}</span> → <span style={{color:"#16a34a"}}>{h.to}</span> <span style={{color:"#b0b0c8"}}>@ {h.at}</span></div>)}</div>}
        </div>
      </div>
    </div>
  );
}

// ─── LEAVE MODAL ─────────────────────────────────────────────────────────────
function LeaveModal({staffMember,bookings,onClose,onConfirm}){
  const [lt,setLt]=useState("mc");
  const [from,setFrom]=useState(TODAY);
  const [to,setTo]=useState(TODAY);
  const [reason,setReason]=useState("");
  const [reassign,setReassign]=useState(0);
  if(!staffMember) return null;
  const dates=dateRange(from,to);
  const affected=bookings.filter(b=>b.staff===staffMember.id&&dates.includes(b.date)&&b.status!=="cancelled");
  const others=INIT_STAFF.filter(s=>s.id!==staffMember.id);
  const ltLabels={mc:"Medical Leave 🏥",al:"Annual Leave 🌴",absent:"Absent ⚠️"};
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:12}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:16,padding:20,width:430,maxWidth:"100%",maxHeight:"93vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.25)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontWeight:700,fontSize:14,color:"#1a1a2e"}}>Mark Leave — {staffMember.name}</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9090b0",padding:"0 4px"}}>×</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div><label style={lbl}>Leave Type</label>
            <div style={{display:"flex",gap:5}}>{Object.entries(ltLabels).map(([k,v])=><button key={k} onClick={()=>setLt(k)} style={{flex:1,padding:"7px 3px",borderRadius:7,border:lt===k?"2px solid #9333ea":"1px solid #ede9fe",background:lt===k?"#f3e8ff":"#fff",color:lt===k?"#7e22ce":"#9090b0",fontWeight:lt===k?700:400,fontSize:9,cursor:"pointer"}}>{v}</button>)}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            <div><label style={lbl}>From Date</label><input type="date" value={from} onChange={e=>{setFrom(e.target.value);if(e.target.value>to)setTo(e.target.value);}} style={inp}/></div>
            <div><label style={lbl}>To Date</label><input type="date" value={to} onChange={e=>setTo(e.target.value)} min={from} style={inp}/></div>
          </div>
          {dates.length>1&&<div style={{padding:"5px 9px",background:"#f3e8ff",borderRadius:6,fontSize:10,color:"#7e22ce",fontWeight:500}}>{dates.length} days: {fmtD(from)} – {fmtD(to)}</div>}
          <div><label style={lbl}>Reason / Remark</label><input value={reason} onChange={e=>setReason(e.target.value)} placeholder="e.g. hospitalised, personal matter" style={inp}/></div>
          {affected.length>0?(
            <div style={{background:"#fdf4ff",border:"1px solid #e9d5ff",borderRadius:9,padding:"10px 12px"}}>
              <div style={{fontSize:10,fontWeight:700,color:"#7e22ce",marginBottom:7}}>⚠️ {affected.length} Affected Booking(s)</div>
              <div style={{maxHeight:110,overflowY:"auto",marginBottom:8}}>
                {affected.map(b=>{const sv=ALL_SERVICES.find(s=>s.id===b.service);return<div key={b.id} style={{fontSize:9,color:"#4a4a6a",padding:"2px 0",borderBottom:"1px solid #ede9fe",display:"flex",justifyContent:"space-between"}}><span>{fmtD(b.date)} {b.time} — {b.customer}</span><span style={{color:"#9090b0"}}>{sv?.name}</span></div>;})}
              </div>
              <div><label style={lbl}>Reassign all to</label>
                <select value={reassign} onChange={e=>setReassign(Number(e.target.value))} style={inp}>
                  <option value={0}>— Mark as Unassigned —</option>
                  {others.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
          ):<div style={{padding:"8px 11px",background:"#f0fdf4",borderRadius:7,fontSize:10,color:"#15803d"}}>✓ No bookings during this leave period.</div>}
          <div style={{display:"flex",gap:7,marginTop:2}}>
            <button onClick={()=>onConfirm(staffMember.id,dates,lt,reason,affected,reassign)} style={pBtn({flex:1,padding:"9px 0",fontSize:11})}>Confirm Leave</button>
            <button onClick={onClose} style={gBtn({flex:1,padding:"9px 0",fontSize:11})}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SCHEDULE MODAL ──────────────────────────────────────────────────────────
function ScheduleModal({staffMember,schedule,onClose,onSave}){
  const defSched={0:{s:"09:00",e:"17:00",off:true},1:{s:"09:00",e:"19:00",off:false},2:{s:"09:00",e:"19:00",off:false},3:{s:"09:00",e:"19:00",off:false},4:{s:"09:00",e:"19:00",off:false},5:{s:"09:00",e:"19:00",off:false},6:{s:"09:00",e:"17:00",off:false}};
  const [sc,setSc]=useState(schedule||defSched);
  if(!staffMember) return null;
  const up=(d,f,v)=>setSc(p=>({...p,[d]:{...p[d],[f]:v}}));
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:12}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:16,padding:20,width:400,maxWidth:"100%",maxHeight:"93vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.25)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontWeight:700,fontSize:14,color:"#1a1a2e"}}>Edit Schedule — {staffMember.name}</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9090b0",padding:"0 4px"}}>×</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {[0,1,2,3,4,5,6].map(d=>{const row=sc[d]||{s:"09:00",e:"19:00",off:false};return(
            <div key={d} style={{display:"grid",gridTemplateColumns:"44px 1fr 1fr 58px",gap:6,alignItems:"center",padding:"7px 9px",background:row.off?"#f8f8f8":"#f8f7ff",borderRadius:7,border:"1px solid #ede9fe"}}>
              <div style={{fontSize:11,fontWeight:600,color:row.off?"#b0b0c8":"#1a1a2e"}}>{DAY_NAMES[d]}</div>
              {row.off?<div style={{gridColumn:"2/4",fontSize:10,color:"#b0b0c8",fontStyle:"italic"}}>Day Off</div>:<>
                <div><select value={row.s} onChange={e=>up(d,"s",e.target.value)} style={{...inp,padding:"4px 6px",fontSize:10}}>{HOURS.map(h=><option key={h} value={h}>{h}</option>)}</select></div>
                <div><select value={row.e} onChange={e=>up(d,"e",e.target.value)} style={{...inp,padding:"4px 6px",fontSize:10}}>{HOURS.map(h=><option key={h} value={h}>{h}</option>)}</select></div>
              </>}
              <button onClick={()=>up(d,"off",!row.off)} style={{padding:"4px 5px",borderRadius:5,border:`1px solid ${row.off?"#86efac":"#fca5a5"}`,background:row.off?"#f0fdf4":"#fef2f2",color:row.off?"#15803d":"#991b1b",cursor:"pointer",fontSize:9,fontWeight:600}}>{row.off?"✓ Work":"✕ Off"}</button>
            </div>
          );})}
        </div>
        <div style={{display:"flex",gap:7,marginTop:12}}>
          <button onClick={()=>onSave(staffMember.id,sc)} style={pBtn({flex:1,padding:"9px 0",fontSize:11})}>Save Schedule</button>
          <button onClick={onClose} style={gBtn({flex:1,padding:"9px 0",fontSize:11})}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── ADD / EDIT STAFF MODAL ───────────────────────────────────────────────────
function StaffModal({staffMember,onClose,onSave,isNew}){
  const blank={id:Date.now(),name:"",avatar:"",color:"#a855f7",photo:null,phone:"",emergencyName:"",emergencyPhone:"",position:"Junior Beautician",skills:[],ic:""};
  const [form,setForm]=useState(staffMember||blank);
  const fileRef=useRef();
  const up=(k,v)=>setForm(p=>({...p,[k]:v}));
  const toggleSkill=(s)=>setForm(p=>({...p,skills:p.skills.includes(s)?p.skills.filter(x=>x!==s):[...p.skills,s]}));
  const handlePhoto=(e)=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>up("photo",ev.target.result);reader.readAsDataURL(file);};
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:12}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:16,padding:20,width:460,maxWidth:"100%",maxHeight:"93vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.25)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontWeight:700,fontSize:14,color:"#1a1a2e"}}>{isNew?"➕ Add Staff":"✏️ Edit Staff"}</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9090b0",padding:"0 4px"}}>×</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {/* Photo */}
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div onClick={()=>fileRef.current?.click()} style={{width:64,height:64,borderRadius:"50%",background:form.photo?"transparent":form.color||"#a855f7",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden",border:"2px dashed #d8b4fe",flexShrink:0}}>
              {form.photo?<img src={form.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{color:"#fff",fontWeight:700,fontSize:22}}>{form.name?form.name[0]:"+"}</span>}
            </div>
            <div>
              <button onClick={()=>fileRef.current?.click()} style={gBtn({fontSize:11,padding:"6px 12px"})}>📷 Upload Photo</button>
              <div style={{fontSize:9,color:"#9090b0",marginTop:4}}>Click avatar to upload</div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}}/>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            <div><label style={lbl}>Full Name</label><input value={form.name} onChange={e=>{up("name",e.target.value);up("avatar",e.target.value[0]?.toUpperCase()||"");}} placeholder="e.g. Siti Rahimah" style={inp}/></div>
            <div><label style={lbl}>IC Number</label><input value={form.ic} onChange={e=>up("ic",e.target.value)} placeholder="900101-14-1234" style={inp}/></div>
          </div>
          <div><label style={lbl}>Current Position / Level</label>
            <select value={form.position} onChange={e=>up("position",e.target.value)} style={inp}>
              {POSITIONS.map(p=><option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            <div><label style={lbl}>Contact Number</label><input value={form.phone} onChange={e=>up("phone",e.target.value)} placeholder="012-3456789" style={inp}/></div>
            <div><label style={lbl}>Avatar Colour</label>
              <div style={{display:"flex",gap:5,paddingTop:4}}>
                {["#a855f7","#ec4899","#06b6d4","#f59e0b","#10b981","#ef4444","#6366f1"].map(c=>(
                  <button key={c} onClick={()=>up("color",c)} style={{width:24,height:24,borderRadius:"50%",background:c,border:form.color===c?"3px solid #1a1a2e":"2px solid transparent",cursor:"pointer",flexShrink:0}}/>
                ))}
              </div>
            </div>
          </div>
          <div style={{background:"#f8f7ff",borderRadius:8,padding:"10px 12px"}}>
            <div style={{fontSize:10,fontWeight:700,color:"#7e22ce",marginBottom:7}}>🚨 Emergency Contact</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
              <div><label style={lbl}>Name (Relationship)</label><input value={form.emergencyName} onChange={e=>up("emergencyName",e.target.value)} placeholder="e.g. Ahmad (Husband)" style={inp}/></div>
              <div><label style={lbl}>Phone</label><input value={form.emergencyPhone} onChange={e=>up("emergencyPhone",e.target.value)} placeholder="017-9988776" style={inp}/></div>
            </div>
          </div>
          <div>
            <label style={lbl}>🎯 Skills / Services Available</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {SKILL_OPTIONS.map(s=>{const sel=form.skills.includes(s);return(
                <button key={s} onClick={()=>toggleSkill(s)} style={{padding:"4px 10px",borderRadius:20,border:sel?"2px solid #9333ea":"1px solid #ede9fe",background:sel?"#f3e8ff":"#fff",color:sel?"#7e22ce":"#9090b0",fontSize:10,fontWeight:sel?600:400,cursor:"pointer"}}>{s}</button>
              );})}
            </div>
          </div>
          <button onClick={()=>{if(!form.name)return;onSave(form,isNew);}} style={pBtn({padding:"10px 0",fontSize:12,width:"100%",marginTop:2})}>{isNew?"Add Staff":"Save Changes"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── EDIT CUSTOMER MODAL ─────────────────────────────────────────────────────
function CustomerEditModal({customer,extraData,onClose,onSave}){
  const [form,setForm]=useState({name:customer.name,phone:customer.phone,...(extraData||{ic:"",email:"",gender:"",birthday:""})});
  const up=(k,v)=>setForm(p=>({...p,[k]:v}));
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:12}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:16,padding:20,width:400,maxWidth:"100%",boxShadow:"0 24px 64px rgba(0,0,0,0.25)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontWeight:700,fontSize:14,color:"#1a1a2e"}}>✏️ Edit Customer</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9090b0",padding:"0 4px"}}>×</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            <div><label style={lbl}>Full Name</label><input value={form.name} onChange={e=>up("name",e.target.value)} style={inp}/></div>
            <div><label style={lbl}>IC Number</label><input value={form.ic} onChange={e=>up("ic",e.target.value)} placeholder="900101-14-1234" style={inp}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            <div><label style={lbl}>Phone</label><input value={form.phone} onChange={e=>up("phone",e.target.value)} style={inp}/></div>
            <div><label style={lbl}>Email</label><input value={form.email} onChange={e=>up("email",e.target.value)} placeholder="email@example.com" style={inp}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            <div><label style={lbl}>Gender</label>
              <select value={form.gender} onChange={e=>up("gender",e.target.value)} style={inp}>
                <option value="">Select...</option>
                <option value="F">Female</option>
                <option value="M">Male</option>
              </select>
            </div>
            <div><label style={lbl}>Birthday</label><input type="date" value={form.birthday} onChange={e=>up("birthday",e.target.value)} style={inp}/></div>
          </div>
          <button onClick={()=>onSave(form)} style={pBtn({padding:"9px 0",fontSize:12,width:"100%",marginTop:2})}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// ─── NOTIFICATIONS PANEL ─────────────────────────────────────────────────────
function NotifPanel({show,onClose,bookings,onSelectBooking}){
  if(!show) return null;
  const pending=bookings.filter(b=>b.status==="pending");
  const unassigned=bookings.filter(b=>b.status==="unassigned");
  const all=[...unassigned.map(b=>({...b,_type:"unassigned"})),...pending.map(b=>({...b,_type:"pending"}))];
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:350}}>
      <div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:56,right:14,width:300,background:"#fff",borderRadius:14,border:"1px solid #ede9fe",boxShadow:"0 8px 32px rgba(124,58,237,0.15)",overflow:"hidden"}}>
        <div style={{padding:"10px 14px",borderBottom:"1px solid #f0ebff",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontWeight:700,fontSize:12,color:"#1a1a2e"}}>🔔 Notifications {all.length>0&&<span style={{background:"#ef4444",color:"#fff",borderRadius:10,fontSize:9,fontWeight:700,padding:"1px 5px",marginLeft:5}}>{all.length}</span>}</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#9090b0"}}>×</button>
        </div>
        {all.length===0?<div style={{padding:"20px 14px",textAlign:"center",color:"#9090b0",fontSize:11}}>✅ All caught up! No pending actions.</div>:(
          <div style={{maxHeight:340,overflowY:"auto"}}>
            {all.map(b=>{const s=ALL_SERVICES.find(sv=>sv.id===b.service);return(
              <div key={b.id} onClick={()=>{onSelectBooking(b);onClose();}} style={{padding:"10px 13px",borderBottom:"1px solid #f5f3ff",display:"flex",gap:9,alignItems:"flex-start",cursor:"pointer",transition:"background 0.1s"}} onMouseEnter={e=>e.currentTarget.style.background="#f8f7ff"} onMouseLeave={e=>e.currentTarget.style.background=""}>
                <div style={{width:30,height:30,borderRadius:"50%",background:b._type==="unassigned"?"linear-gradient(135deg,#7e22ce,#a855f7)":"linear-gradient(135deg,#d97706,#fbbf24)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{b._type==="unassigned"?"⚠️":"⏳"}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:11,color:"#1a1a2e"}}>{b.customer}</div>
                  <div style={{fontSize:9,color:"#9090b0"}}>{s?.name} · {fmtD(b.date)} {b.time}</div>
                  <div style={{marginTop:2,padding:"1px 6px",borderRadius:20,display:"inline-block",fontSize:8,fontWeight:600,...(b._type==="unassigned"?{background:"#fdf4ff",color:"#7e22ce"}:{background:"#fffbeb",color:"#92400e"})}}>{b._type==="unassigned"?"Unassigned — needs staff":"Pending confirmation"}</div>
                </div>
                <span style={{fontSize:10,color:"#c084fc"}}>›</span>
              </div>
            );})}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function BeaubookDashboard(){
  const [tab,setTab]=useState("calendar");
  const [bookings,setBookings]=useState([]);
  const [staffList,setStaffList]=useState([]);
  const [leaveRecords,setLeaveRecords]=useState([]);
  const [schedules,setSchedules]=useState({});
  const [customerExtra,setCustomerExtra]=useState({});
  const [custNotes,setCustNotes]=useState({});
  const [selectedDate,setSelectedDate]=useState(TODAY);
  const [calView,setCalView]=useState("week");
  const [monthYear,setMonthYear]=useState({y:2026,m:5});
  const [weekBase,setWeekBase]=useState(TODAY);
  const [filterStaff,setFilterStaff]=useState(0);
  const [selBooking,setSelBooking]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [addDate,setAddDate]=useState(TODAY);
  const [addTime,setAddTime]=useState("09:00");
  const [showNotif,setShowNotif]=useState(false);
  const [toast,setToast]=useState(null);
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const [selCustomer,setSelCustomer]=useState(null);
  const [editCustomer,setEditCustomer]=useState(null);
  const [custSearch,setCustSearch]=useState("");
  const [custSort,setCustSort]=useState("recent");
  const [custFilter,setCustFilter]=useState("all");
  const [custNoteEdit,setCustNoteEdit]=useState("");
  const [leaveStaff,setLeaveStaff]=useState(null);
  const [schedStaff,setSchedStaff]=useState(null);
  const [editStaff,setEditStaff]=useState(null);
  const [addStaff,setAddStaff]=useState(false);
  const [notifTriggered,setNotifTriggered]=useState(false);
  const [staffMonth,setStaffMonth]=useState({m:5,y:2026});

  function showToast(msg,type="success"){setToast({msg,type});setTimeout(()=>setToast(null),3000);}
  const svc=id=>ALL_SERVICES.find(s=>s.id===id);
  const stf=id=>staffList.find(s=>s.id===id);
  const isOL=(staffId,date)=>leaveRecords.some(r=>r.staffId===staffId&&r.dates.includes(date));

  useEffect(()=>{
    fetch("/api/bookings").then(r=>r.json()).then(setBookings);
    fetch("/api/staff").then(r=>r.json()).then(setStaffList);
    fetch("/api/leave").then(r=>r.json()).then(setLeaveRecords);
    fetch("/api/schedules").then(r=>r.json()).then(setSchedules);
    fetch("/api/customers").then(r=>r.json()).then(({extra,notes})=>{setCustomerExtra(extra);setCustNotes(notes);});
  },[]);

  function patchBooking(id,data){return fetch(`/api/bookings/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)}).then(r=>r.json());}

  function handleAccept(id){patchBooking(id,{status:"confirmed"}).then(updated=>{setBookings(p=>p.map(b=>b.id===id?updated:b));setSelBooking(p=>p?.id===id?updated:p);showToast("Booking confirmed!");});}
  function handleCancel(id){patchBooking(id,{status:"cancelled"}).then(updated=>{setBookings(p=>p.map(b=>b.id===id?updated:b));setSelBooking(null);showToast("Booking cancelled.","error");});}
  function handleSaveEdit(b,draft){
    const now=nowStr();const ch=[];
    const chk=(f,o,n)=>{if(String(o)!==String(n))ch.push({field:f,from:String(o||"—"),to:String(n||"—"),at:now});};
    chk("Date",b.date,draft.date);chk("Time",b.time,draft.time);chk("Service",svc(b.service)?.name,svc(draft.service)?.name);chk("Staff",stf(b.staff)?.name,stf(draft.staff)?.name);chk("Seat",b.seat||"—",draft.seat||"—");chk("Remark",b.remark||"",draft.remark||"");chk("PayStatus",b.payStatus,draft.payStatus);chk("PayMethod",b.payMethod||"—",draft.payMethod||"—");chk("AmtPaid",b.amtPaid||0,draft.amtPaid||0);chk("TXN",b.txnId||"—",draft.txnId||"—");
    const history=[...(b.history||[]),...ch];
    patchBooking(b.id,{...draft,history}).then(updated=>{setBookings(p=>p.map(bk=>bk.id===b.id?updated:bk));setSelBooking(updated);showToast("Changes saved!");});
  }
  function handleAddBooking(form){
    fetch("/api/bookings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)}).then(r=>r.json()).then(created=>{setBookings(p=>[...p,created]);setShowAdd(false);showToast("Booking added!");});
  }
  function handleLeave(staffId,dates,lt,reason,affected,reassign){
    const now=nowStr();
    fetch("/api/leave",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({staffId,dates,leaveType:lt,reason,affected,reassign,now})}).then(r=>r.json()).then(({leaveRecord,updatedBookings})=>{
      setLeaveRecords(p=>[...p,leaveRecord]);
      setBookings(prev=>prev.map(b=>updatedBookings.find(u=>u.id===b.id)||b));
      setLeaveStaff(null);showToast("Leave recorded!");
    });
  }
  function handleSaveSched(staffId,sc){
    fetch(`/api/schedules/${staffId}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(sc)}).then(r=>r.json()).then(()=>{setSchedules(p=>({...p,[staffId]:sc}));setSchedStaff(null);showToast("Schedule saved!");});
  }
  function handleSaveStaff(form,isNew){
    const req=isNew
      ?fetch("/api/staff",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)})
      :fetch(`/api/staff/${form.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
    req.then(r=>r.json()).then(saved=>{
      if(isNew){setStaffList(p=>[...p,saved]);}
      else{setStaffList(p=>p.map(s=>s.id===saved.id?saved:s));}
      setEditStaff(null);setAddStaff(false);showToast(isNew?"Staff added!":"Staff updated!");
    });
  }
  function handleSaveCustomer(form){
    fetch(`/api/customers/${editCustomer.phone}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)}).then(r=>r.json()).then(({extra,updatedBookings})=>{
      setCustomerExtra(p=>({...p,[form.phone]:{ic:extra.ic,email:extra.email,gender:extra.gender,birthday:extra.birthday}}));
      setBookings(p=>p.map(b=>updatedBookings.find(u=>u.id===b.id)||b));
      setEditCustomer(null);showToast("Customer info saved!");
    });
  }

  function getSlotBks(date,hour,staffId){return bookings.filter(b=>{if(b.date!==date||b.staff!==staffId||b.status==="cancelled")return false;const bm=timeToMin(b.time),sm=timeToMin(hour),dur=svc(b.service)?.duration||60;return bm<=sm&&sm<bm+dur;});}

  const allCustomers=useMemo(()=>{
    const map={};
    bookings.forEach(b=>{if(b.status==="cancelled")return;const k=b.phone;if(!map[k])map[k]={name:b.customer,phone:b.phone,visits:[]};map[k].visits.push(b);});
    return Object.values(map).map(c=>{
      const sorted=[...c.visits].sort((a,b2)=>b2.date.localeCompare(a.date));
      const spend=c.visits.reduce((s,v)=>s+(svc(v.service)?.price||0),0);
      const hasUnpaid=c.visits.some(v=>v.payStatus==="unpaid"||v.payStatus==="partial");
      const isNew=c.visits.length===1;const isVip=c.visits.length>=4||spend>=400;
      const sc2={};c.visits.forEach(v=>{sc2[v.service]=(sc2[v.service]||0)+1;});
      const favSvcId=Number(Object.entries(sc2).sort((a,b2)=>b2[1]-a[1])[0]?.[0]);
      return{...c,spend,hasUnpaid,isNew,isVip,lastVisit:sorted[0]?.date||"",firstVisit:sorted[sorted.length-1]?.date||"",avg:Math.round(spend/c.visits.length),favSvcId,count:c.visits.length,sorted};
    });
  },[bookings]);

  const pendingAll=bookings.filter(b=>b.status==="pending");
  const unassignedAll=bookings.filter(b=>b.status==="unassigned");
  const notifCount=pendingAll.length+unassignedAll.length;
  const wkDates=getWkDates(weekBase);
  const todayStats={
    total:bookings.filter(b=>b.date===selectedDate&&b.status!=="cancelled").length,
    confirmed:bookings.filter(b=>b.date===selectedDate&&b.status==="confirmed").length,
    pending:bookings.filter(b=>b.date===selectedDate&&b.status==="pending").length,
    revenue:bookings.filter(b=>b.date===selectedDate&&b.status==="confirmed").reduce((s,b)=>s+(svc(b.service)?.price||0),0),
  };
  const monthDays=useMemo(()=>{const{y,m}=monthYear;const dim=getDIM(y,m);const fd=getFD(y,m);const days=[];for(let i=0;i<fd;i++)days.push(null);for(let d=1;d<=dim;d++)days.push(`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`);return days;},[monthYear]);

  // Upcoming bookings (today or later, confirmed/pending)
  const upcomingBks=bookings.filter(b=>isUpcoming(b.date)&&b.status!=="cancelled").sort((a,b2)=>a.date.localeCompare(b2.date)||a.time.localeCompare(b2.time)).slice(0,20);

  return(
    <div style={{fontFamily:"'Inter',system-ui,sans-serif",minHeight:"100vh",background:"#f8f7ff",display:"flex",flexDirection:"column"}}>

      {/* NAV */}
      <nav style={{background:"#fff",borderBottom:"1px solid #ede9fe",padding:"0 16px",height:50,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:200}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={()=>setSidebarOpen(!sidebarOpen)} style={{background:"none",border:"none",cursor:"pointer",padding:5,color:"#7e22ce",display:"flex"}}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div style={{width:24,height:24,borderRadius:6,background:"linear-gradient(135deg,#7e22ce,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#fff",fontWeight:700,fontSize:11}}>B</span></div>
          <div><div style={{fontWeight:700,fontSize:13,color:"#1a1a2e",letterSpacing:-0.3}}>Beaubook</div><div style={{fontSize:8,color:"#9333ea",fontWeight:600}}>MERCHANT DASHBOARD</div></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          {/* Notification bell */}
          <button onClick={()=>setShowNotif(p=>!p)} style={{position:"relative",background:"none",border:"none",cursor:"pointer",padding:5,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="19" height="19" fill="none" stroke={notifCount>0?"#7e22ce":"#9090b0"} strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            {notifCount>0&&<span style={{position:"absolute",top:1,right:1,background:"#ef4444",color:"#fff",borderRadius:10,fontSize:8,fontWeight:700,minWidth:13,height:13,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 2px"}}>{notifCount}</span>}
          </button>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:24,height:24,borderRadius:"50%",background:"linear-gradient(135deg,#9333ea,#c084fc)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:600,fontSize:9}}>GL</div>
            <span style={{fontSize:11,color:"#4a4a6a",fontWeight:500}}>Glam Lab KL</span>
          </div>
        </div>
      </nav>

      <div style={{display:"flex",flex:1}}>
        {/* SIDEBAR */}
        {sidebarOpen&&<aside style={{width:175,background:"#fff",borderRight:"1px solid #ede9fe",padding:"10px 7px",display:"flex",flexDirection:"column",gap:2,flexShrink:0}}>
          {[{id:"calendar",icon:"📅",label:"Calendar"},{id:"bookings",icon:"📋",label:"Bookings",badge:pendingAll.length+unassignedAll.length},{id:"customers",icon:"👤",label:"Customers"},{id:"staff",icon:"👥",label:"Staff"},{id:"services",icon:"✂️",label:"Services"},{id:"analytics",icon:"📊",label:"Analytics"}].map(item=>(
            <button key={item.id} onClick={()=>setTab(item.id)} style={{display:"flex",alignItems:"center",gap:7,padding:"8px 9px",borderRadius:7,border:"none",cursor:"pointer",textAlign:"left",width:"100%",background:tab===item.id?"#f3e8ff":"transparent",color:tab===item.id?"#7e22ce":"#64648a",fontWeight:tab===item.id?600:400,fontSize:12}}>
              <span>{item.icon}</span><span style={{flex:1}}>{item.label}</span>
              {item.badge>0&&<span style={{background:"#ef4444",color:"#fff",borderRadius:10,fontSize:8,fontWeight:700,padding:"1px 4px"}}>{item.badge}</span>}
            </button>
          ))}
        </aside>}

        <main style={{flex:1,padding:16,overflowY:"auto"}}>
          {/* Toast */}
          {toast&&<div style={{position:"fixed",top:58,right:16,zIndex:999,padding:"8px 14px",borderRadius:9,background:toast.type==="success"?"#f0fdf4":"#fef2f2",border:`1px solid ${toast.type==="success"?"#86efac":"#fca5a5"}`,color:toast.type==="success"?"#15803d":"#991b1b",fontWeight:600,fontSize:11,boxShadow:"0 4px 20px rgba(0,0,0,0.1)",display:"flex",alignItems:"center",gap:6,zIndex:9999}}>
            {toast.type==="success"?"✓":"✕"} {toast.msg}
          </div>}

          {/* ═══ CALENDAR ═══ */}
          {tab==="calendar"&&<div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,marginBottom:12}}>
              {[{l:"Today",v:todayStats.total,ic:"📅",c:"#7e22ce"},{l:"Confirmed",v:todayStats.confirmed,ic:"✓",c:"#16a34a"},{l:"Pending",v:todayStats.pending,ic:"⏳",c:"#d97706"},{l:"Revenue",v:`RM${todayStats.revenue}`,ic:"💰",c:"#0891b2"}].map(s=>(
                <div key={s.l} style={card({padding:"10px 12px"})}><div style={{fontSize:16,marginBottom:2}}>{s.ic}</div><div style={{fontSize:18,fontWeight:700,color:s.c}}>{s.v}</div><div style={{fontSize:9,color:"#9090b0",marginTop:1}}>{s.l}</div></div>
              ))}
            </div>
            {unassignedAll.length>0&&<div style={{background:"#fdf4ff",border:"1px solid #e9d5ff",borderRadius:8,padding:"8px 12px",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
              <span>⚠️</span><div style={{flex:1,fontWeight:600,color:"#7e22ce",fontSize:11}}>{unassignedAll.length} unassigned — staff on leave</div>
              <button onClick={()=>setTab("bookings")} style={gBtn({fontSize:9,padding:"3px 8px"})}>Assign</button>
            </div>}

            <div style={card({marginBottom:12,overflow:"hidden"})}>
              <div style={{display:"flex",alignItems:"center",padding:"8px 11px",borderBottom:"1px solid #ede9fe",gap:6,flexWrap:"wrap"}}>
                <div style={{display:"flex",gap:2,background:"#f3e8ff",borderRadius:6,padding:2}}>
                  {["week","month"].map(v=><button key={v} onClick={()=>setCalView(v)} style={{padding:"3px 9px",borderRadius:5,border:"none",cursor:"pointer",fontSize:10,fontWeight:700,background:calView===v?"#7e22ce":"transparent",color:calView===v?"#fff":"#9333ea"}}>{v==="week"?"Week":"Month"}</button>)}
                </div>
                {calView==="week"&&<>
                  <button onClick={()=>{const d=new Date(weekBase);d.setDate(d.getDate()-7);setWeekBase(d.toISOString().split("T")[0]);}} style={gBtn({padding:"3px 8px",fontSize:10})}>←</button>
                  <div style={{display:"flex",flex:1,gap:2}}>
                    {wkDates.map((date,i)=>{const isSel=date===selectedDate;const cnt=bookings.filter(b=>b.date===date&&b.status!=="cancelled").length;return(
                      <button key={date} onClick={()=>setSelectedDate(date)} style={{flex:1,padding:"3px 1px",borderRadius:5,border:isSel?"2px solid #9333ea":"1px solid #ede9fe",background:isSel?"#f3e8ff":"#fff",cursor:"pointer"}}>
                        <div style={{fontSize:8,color:isSel?"#7e22ce":"#9090b0",fontWeight:600}}>{DAY_NAMES[i]}</div>
                        <div style={{fontSize:11,fontWeight:700,color:isSel?"#7e22ce":"#1a1a2e"}}>{parseInt(date.split("-")[2])}</div>
                        {cnt>0&&<div style={{width:4,height:4,borderRadius:"50%",background:isSel?"#9333ea":"#c084fc",margin:"2px auto 0"}}/>}
                      </button>
                    );})}
                  </div>
                  <button onClick={()=>{const d=new Date(weekBase);d.setDate(d.getDate()+7);setWeekBase(d.toISOString().split("T")[0]);}} style={gBtn({padding:"3px 8px",fontSize:10})}>→</button>
                </>}
                {calView==="month"&&<>
                  <button onClick={()=>setMonthYear(p=>{const m=p.m-1<0?11:p.m-1;return{y:p.m-1<0?p.y-1:p.y,m};})} style={gBtn({padding:"3px 8px",fontSize:10})}>←</button>
                  <div style={{flex:1,textAlign:"center",fontWeight:700,fontSize:12,color:"#1a1a2e"}}>{MONTHS_EN[monthYear.m]} {monthYear.y}</div>
                  <button onClick={()=>setMonthYear(p=>{const m=p.m+1>11?0:p.m+1;return{y:p.m+1>11?p.y+1:p.y,m};})} style={gBtn({padding:"3px 8px",fontSize:10})}>→</button>
                </>}
                <button onClick={()=>{setAddDate(selectedDate);setAddTime("09:00");setShowAdd(true);}} style={pBtn({padding:"5px 11px",fontSize:11,marginLeft:"auto"})}>+ Add</button>
              </div>

              {calView==="week"&&<>
                <div style={{padding:"6px 11px",borderBottom:"1px solid #ede9fe",display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                  <span style={{fontSize:9,color:"#9090b0",fontWeight:600}}>STAFF:</span>
                  {[{id:0,name:"All"},...staffList].map(s=>(
                    <button key={s.id} onClick={()=>setFilterStaff(s.id)} style={{padding:"2px 8px",borderRadius:20,border:filterStaff===s.id?"2px solid #9333ea":"1px solid #ede9fe",background:filterStaff===s.id?"#f3e8ff":"#fff",cursor:"pointer",fontSize:9,fontWeight:filterStaff===s.id?600:400,color:filterStaff===s.id?"#7e22ce":"#64648a",display:"flex",alignItems:"center",gap:3}}>
                      {s.name}{s.id>0&&isOL(s.id,selectedDate)&&<span style={{fontSize:7,background:"#fef2f2",color:"#991b1b",padding:"0 3px",borderRadius:3}}>Off</span>}
                    </button>
                  ))}
                </div>
                <div style={{overflowX:"auto"}}>
                  <div style={{minWidth:440}}>
                    <div style={{display:"grid",gridTemplateColumns:`48px repeat(${filterStaff===0?staffList.length:1},1fr)`,borderBottom:"1px solid #ede9fe"}}>
                      <div style={{padding:"5px 6px",fontSize:8,color:"#9090b0",fontWeight:600}}>TIME</div>
                      {staffList.filter(s=>filterStaff===0||s.id===filterStaff).map(s=>(
                        <div key={s.id} style={{padding:"5px 7px",fontSize:9,fontWeight:600,color:"#4a4a6a",borderLeft:"1px solid #ede9fe",display:"flex",alignItems:"center",gap:4}}>
                          {s.photo?<img src={s.photo} alt="" style={{width:16,height:16,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>:<div style={{width:16,height:16,borderRadius:"50%",background:isOL(s.id,selectedDate)?"#d1d5db":s.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:7,fontWeight:700,flexShrink:0}}>{s.avatar}</div>}
                          {s.name}{isOL(s.id,selectedDate)&&<span style={{fontSize:7,color:"#991b1b",background:"#fef2f2",padding:"0 3px",borderRadius:3}}>Off</span>}
                        </div>
                      ))}
                    </div>
                    {HOURS.map(hour=>(
                      <div key={hour} style={{display:"grid",gridTemplateColumns:`48px repeat(${filterStaff===0?staffList.length:1},1fr)`,borderBottom:`1px solid ${hour.endsWith(":00")?"#ede9fe":"#f8f6ff"}`,minHeight:30}}>
                        <div style={{padding:"2px 6px",fontSize:8,color:hour.endsWith(":00")?"#7e22ce":"#d0c8f0",fontWeight:hour.endsWith(":00")?600:400,paddingTop:4,borderRight:"1px solid #f0ebff"}}>{hour}</div>
                        {staffList.filter(s=>filterStaff===0||s.id===filterStaff).map(s=>{
                          const bks=getSlotBks(selectedDate,hour,s.id).filter(b=>b.time===hour);
                          const onLeave=isOL(s.id,selectedDate);
                          return(
                            <div key={s.id} onClick={()=>{if(!onLeave){setAddDate(selectedDate);setAddTime(hour);setShowAdd(true);}}} style={{borderLeft:"1px solid #f5f3ff",padding:"2px 3px",minHeight:30,cursor:onLeave?"not-allowed":"pointer",background:onLeave?"repeating-linear-gradient(45deg,#fef2f2,#fef2f2 3px,#fff 3px,#fff 6px)":"transparent"}}>
                              {bks.map(b=>{const sc=BC[b.status]||BC.confirmed;const pc2=PC[b.payStatus]||PC.unpaid;return(
                                <div key={b.id} onClick={e=>{e.stopPropagation();setSelBooking(b);}} style={{background:sc.bg,border:`1px solid ${sc.br}`,borderRadius:4,padding:"2px 4px",cursor:"pointer",marginBottom:1}}>
                                  <div style={{fontSize:8,fontWeight:600,color:sc.tx,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{b.customer}</div>
                                  <div style={{display:"flex",gap:2,alignItems:"center"}}>
                                    <span style={{fontSize:7,color:"#9090b0",overflow:"hidden",textOverflow:"ellipsis",maxWidth:50}}>{svc(b.service)?.name}</span>
                                    {b.seat&&<span style={{fontSize:6,background:"#f3e8ff",color:"#7e22ce",padding:"0 2px",borderRadius:3,flexShrink:0}}>🪑{b.seat.replace("Seat ","").replace("Room ","R")}</span>}
                                    <span style={{fontSize:6,padding:"0 2px",borderRadius:3,background:pc2.bg,color:pc2.tx,border:`1px solid ${pc2.br}`,fontWeight:600,flexShrink:0}}>{b.payStatus}</span>
                                  </div>
                                </div>
                              );})}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </>}

              {calView==="month"&&<div style={{padding:9}}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1,marginBottom:3}}>
                  {DAY_NAMES.map(d=><div key={d} style={{textAlign:"center",fontSize:8,fontWeight:600,color:"#9090b0",padding:"2px 0"}}>{d}</div>)}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
                  {monthDays.map((date,i)=>{
                    if(!date)return<div key={`e${i}`}/>;
                    const cnt=bookings.filter(b=>b.date===date&&b.status!=="cancelled").length;
                    const rev=bookings.filter(b=>b.date===date&&b.status==="confirmed").reduce((s,b)=>s+(svc(b.service)?.price||0),0);
                    const hasPend=bookings.some(b=>b.date===date&&b.status==="pending");
                    const hasUna=bookings.some(b=>b.date===date&&b.status==="unassigned");
                    const isToday=date===TODAY;const isSel=date===selectedDate;
                    return(
                      <div key={date} onClick={()=>{setSelectedDate(date);setCalView("week");const d=new Date(date);const dy=d.getDay();const base=new Date(d);base.setDate(d.getDate()-dy);setWeekBase(base.toISOString().split("T")[0]);}} style={{minHeight:58,borderRadius:6,border:isSel?"2px solid #9333ea":isToday?"2px solid #c084fc":"1px solid #ede9fe",background:isSel?"#f3e8ff":isToday?"#fdf4ff":"#fff",cursor:"pointer",padding:"3px 4px"}}>
                        <div style={{fontSize:10,fontWeight:isSel||isToday?700:400,color:isSel?"#7e22ce":isToday?"#9333ea":"#1a1a2e"}}>{parseInt(date.split("-")[2])}</div>
                        {cnt>0&&<>
                          <div style={{fontSize:8,color:"#7e22ce",fontWeight:600,marginTop:1}}>{cnt} bk</div>
                          {rev>0&&<div style={{fontSize:7,color:"#0891b2",fontWeight:600}}>RM{rev}</div>}
                          <div style={{display:"flex",gap:2,marginTop:1,flexWrap:"wrap"}}>
                            {hasPend&&<span style={{width:5,height:5,borderRadius:"50%",background:"#fbbf24",display:"inline-block"}}/>}
                            {hasUna&&<span style={{width:5,height:5,borderRadius:"50%",background:"#a855f7",display:"inline-block"}}/>}
                            {!hasPend&&!hasUna&&<span style={{width:5,height:5,borderRadius:"50%",background:"#86efac",display:"inline-block"}}/>}
                          </div>
                        </>}
                        {cnt===0&&<div style={{fontSize:7,color:"#d8b4fe",marginTop:2}}>Free</div>}
                      </div>
                    );
                  })}
                </div>
                <div style={{display:"flex",gap:10,marginTop:7,justifyContent:"center",flexWrap:"wrap"}}>
                  {[["#86efac","Confirmed"],["#fbbf24","Pending"],["#a855f7","Unassigned"],["#ede9fe","Free"]].map(([c,l])=>(
                    <div key={l} style={{display:"flex",alignItems:"center",gap:3,fontSize:8,color:"#64648a"}}><span style={{width:6,height:6,borderRadius:"50%",background:c,display:"inline-block"}}/>{l}</div>
                  ))}
                </div>
              </div>}
            </div>
          </div>}

          {/* ═══ BOOKINGS ═══ */}
          {tab==="bookings"&&<div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:11}}>
              <div><h2 style={{margin:0,fontSize:16,fontWeight:700,color:"#1a1a2e"}}>Bookings</h2><p style={{margin:"1px 0 0",fontSize:9,color:"#9090b0"}}>{bookings.filter(b=>b.status!=="cancelled").length} active</p></div>
              <button onClick={()=>{setAddDate(selectedDate);setShowAdd(true);}} style={pBtn({fontSize:11,padding:"7px 13px"})}>+ Add</button>
            </div>
            {pendingAll.length>0&&<div style={{background:"#fffbeb",border:"1px solid #fcd34d",borderRadius:8,padding:"8px 12px",marginBottom:8,display:"flex",gap:8,alignItems:"center"}}><span>⏳</span><div style={{fontWeight:600,color:"#92400e",fontSize:10}}>{pendingAll.length} booking(s) awaiting confirmation</div></div>}
            {unassignedAll.length>0&&<div style={{background:"#fdf4ff",border:"1px solid #e9d5ff",borderRadius:8,padding:"8px 12px",marginBottom:8,display:"flex",gap:8,alignItems:"center"}}><span>⚠️</span><div style={{fontWeight:600,color:"#7e22ce",fontSize:10}}>{unassignedAll.length} unassigned — staff on leave</div></div>}

            {/* Upcoming bookings section */}
            <div style={{fontWeight:700,fontSize:13,color:"#1a1a2e",marginBottom:8,marginTop:4}}>📅 Upcoming Bookings</div>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
              {upcomingBks.map(b=>{
                const sc=BC[b.status]||BC.confirmed;const pc=PC[b.payStatus]||PC.unpaid;const s=svc(b.service);const st=stf(b.staff);
                const price=s?.price||0;const balance=Math.max(0,price-(b.amtPaid||0));
                return(
                  <div key={b.id} style={card({padding:"9px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:9,border:b.status==="pending"?"1px solid #fcd34d":b.status==="unassigned"?"1px solid #e9d5ff":"1px solid #ede9fe"})}>
                    <div onClick={()=>setSelBooking(b)} style={{flex:1,display:"flex",alignItems:"center",gap:9}}>
                      <div style={{textAlign:"center",minWidth:44,cursor:"pointer"}}>
                        <div style={{fontSize:8,color:"#9090b0"}}>{fmtD(b.date)}</div>
                        <div style={{fontSize:12,fontWeight:700,color:"#7e22ce"}}>{b.time}</div>
                      </div>
                      <div style={{width:1,height:28,background:"#ede9fe",flexShrink:0}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:600,fontSize:11,color:"#1a1a2e"}}>{b.customer}</div>
                        <div style={{fontSize:9,color:"#9090b0"}}>{s?.name}{st?` · ${st.name}`:""}{b.seat&&` · 🪑${b.seat}`}</div>
                        {b.remark&&<div style={{fontSize:8,color:"#7e22ce"}}>💬 {b.remark}</div>}
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2,flexShrink:0}}>
                        <span style={{padding:"1px 6px",borderRadius:20,fontSize:8,fontWeight:600,background:sc.bg,color:sc.tx,border:`1px solid ${sc.br}`}}>{b.status}</span>
                        <span style={{padding:"1px 6px",borderRadius:20,fontSize:7,fontWeight:600,background:pc.bg,color:pc.tx,border:`1px solid ${pc.br}`}}>{b.payStatus}</span>
                        {balance>0&&<span style={{fontSize:7,color:"#991b1b",fontWeight:600}}>Bal:RM{balance}</span>}
                      </div>
                    </div>
                    {/* Call / WA buttons */}
                    <div style={{display:"flex",gap:4,flexShrink:0}}>
                      <a href={`tel:${b.phone}`} onClick={e=>e.stopPropagation()} style={{display:"flex",alignItems:"center",justifyContent:"center",width:28,height:28,borderRadius:6,background:"#f0fdf4",border:"1px solid #86efac",color:"#15803d",textDecoration:"none",fontSize:12}}>📞</a>
                      <a href={`https://wa.me/6${b.phone.replace(/-/g,"")}`} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{display:"flex",alignItems:"center",justifyContent:"center",width:28,height:28,borderRadius:6,background:"#f0fdf4",border:"1px solid #86efac",color:"#15803d",textDecoration:"none",fontSize:12}}>💬</a>
                    </div>
                    {b.status==="pending"&&<div style={{display:"flex",gap:3,flexShrink:0}}>
                      <button onClick={e=>{e.stopPropagation();handleAccept(b.id);}} style={{background:"#f0fdf4",border:"1px solid #86efac",color:"#15803d",borderRadius:5,padding:"3px 7px",cursor:"pointer",fontSize:9,fontWeight:600}}>✓</button>
                      <button onClick={e=>{e.stopPropagation();handleCancel(b.id);}} style={{background:"#fef2f2",border:"1px solid #fca5a5",color:"#991b1b",borderRadius:5,padding:"3px 7px",cursor:"pointer",fontSize:9,fontWeight:600}}>✕</button>
                    </div>}
                  </div>
                );
              })}
            </div>
          </div>}

          {/* ═══ CUSTOMERS ═══ */}
          {tab==="customers"&&(()=>{
            const filtered=allCustomers.filter(c=>{const q=custSearch.toLowerCase();return(!q||c.name.toLowerCase().includes(q)||c.phone.includes(q))&&(custFilter==="all"||(custFilter==="vip"&&c.isVip)||(custFilter==="new"&&c.isNew)||(custFilter==="unpaid"&&c.hasUnpaid));}).sort((a,b2)=>custSort==="name"?a.name.localeCompare(b2.name):custSort==="visits"?b2.count-a.count:custSort==="spend"?b2.spend-a.spend:b2.lastVisit.localeCompare(a.lastVisit));
            if(selCustomer){const c=selCustomer;const extra=customerExtra[c.phone]||{};return(
              <div>
                <div style={{display:"flex",gap:7,marginBottom:12}}>
                  <button onClick={()=>setSelCustomer(null)} style={gBtn({fontSize:10})}>← Customers</button>
                  <button onClick={()=>setEditCustomer(c)} style={gBtn({fontSize:10})}>✏️ Edit Info</button>
                </div>
                <div style={card({padding:15,marginBottom:10})}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:12}}>
                    <div style={{width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#9333ea,#c084fc)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:18,flexShrink:0}}>{c.name[0]}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:15,color:"#1a1a2e",marginBottom:1}}>{c.name}</div>
                      <div style={{fontSize:10,color:"#9090b0",marginBottom:6}}>{c.phone}</div>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                        {c.isVip&&<span style={{padding:"1px 7px",borderRadius:20,fontSize:8,fontWeight:700,background:"#fef9c3",color:"#854d0e",border:"1px solid #fde68a"}}>⭐VIP</span>}
                        {c.isNew&&<span style={{padding:"1px 7px",borderRadius:20,fontSize:8,fontWeight:700,background:"#f0fdf4",color:"#15803d",border:"1px solid #86efac"}}>🌱New</span>}
                        {!c.isNew&&!c.isVip&&<span style={{padding:"1px 7px",borderRadius:20,fontSize:8,fontWeight:700,background:"#f3e8ff",color:"#7e22ce",border:"1px solid #d8b4fe"}}>💜Regular</span>}
                        {c.hasUnpaid&&<span style={{padding:"1px 7px",borderRadius:20,fontSize:8,fontWeight:700,background:"#fef2f2",color:"#991b1b",border:"1px solid #fca5a5"}}>⚠️Unpaid</span>}
                      </div>
                    </div>
                    <button onClick={()=>{setAddDate(selectedDate);setShowAdd(true);}} style={pBtn({fontSize:9,padding:"5px 10px"})}>+ Book</button>
                  </div>
                  {/* Extra info */}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6,marginBottom:10}}>
                    {[["IC",extra.ic||"—"],["Email",extra.email||"—"],["Gender",extra.gender==="F"?"Female":extra.gender==="M"?"Male":"—"],["Birthday",extra.birthday?fmtD(extra.birthday):"—"]].map(([l,v])=>(
                      <div key={l} style={{background:"#f8f7ff",borderRadius:7,padding:"6px 9px"}}><div style={{fontSize:8,color:"#9090b0"}}>{l}</div><div style={{fontSize:11,fontWeight:500,color:"#1a1a2e",marginTop:1}}>{v}</div></div>
                    ))}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
                    {[{l:"Visits",v:c.count,ic:"📅"},{l:"Total",v:`RM${c.spend}`,ic:"💰"},{l:"Avg",v:`RM${c.avg}`,ic:"📊"},{l:"Fav",v:svc(c.favSvcId)?.name||"—",ic:"✂️",sm:true}].map(s=>(
                      <div key={s.l} style={{background:"#f8f7ff",borderRadius:7,padding:"7px 8px",textAlign:"center"}}><div style={{fontSize:12,marginBottom:2}}>{s.ic}</div><div style={{fontSize:s.sm?8:12,fontWeight:700,color:"#7e22ce",lineHeight:1.2}}>{s.v}</div><div style={{fontSize:7,color:"#9090b0",marginTop:1}}>{s.l}</div></div>
                    ))}
                  </div>
                </div>
                <div style={card({padding:12,marginBottom:10})}>
                  <div style={{fontWeight:600,fontSize:10,color:"#1a1a2e",marginBottom:6}}>📝 Merchant Note</div>
                  <textarea value={custNoteEdit} onChange={e=>setCustNoteEdit(e.target.value)} onFocus={()=>setCustNoteEdit(custNotes[c.phone]||"")} placeholder="e.g. Allergic to ammonia..." style={{...inp,height:54,resize:"vertical",lineHeight:1.5}}/>
                  <button onClick={()=>{fetch(`/api/customers/${c.phone}/note`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({note:custNoteEdit})}).then(()=>{setCustNotes(p=>({...p,[c.phone]:custNoteEdit}));showToast("Note saved!");});}} style={pBtn({marginTop:5,padding:"5px 12px",fontSize:10})}>Save Note</button>
                </div>
                <div style={card({padding:12})}>
                  <div style={{fontWeight:600,fontSize:10,color:"#1a1a2e",marginBottom:8}}>🕓 Visit History ({c.count})</div>
                  {c.sorted.map((v,i)=>{const sv2=svc(v.service);const st2=stf(v.staff);const pc2=PC[v.payStatus]||PC.unpaid;return(
                    <div key={v.id} style={{display:"flex",gap:8,paddingBottom:8,marginBottom:8,borderBottom:i<c.sorted.length-1?"1px solid #f5f3ff":"none"}}>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}><div style={{width:7,height:7,borderRadius:"50%",background:"#a855f7",flexShrink:0,marginTop:3}}/>{i<c.sorted.length-1&&<div style={{width:1,flex:1,background:"#ede9fe",minHeight:12}}/>}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",justifyContent:"space-between",gap:6}}>
                          <div><div style={{fontWeight:600,fontSize:10,color:"#1a1a2e"}}>{sv2?.name}</div><div style={{fontSize:8,color:"#9090b0"}}>{fmtD(v.date)}, {v.time}{st2?` · ${st2.name}`:""}{v.seat&&` · 🪑${v.seat}`}</div>{v.txnId&&<div style={{fontSize:7,color:"#b0b0c8",fontFamily:"monospace"}}>#{v.txnId}</div>}</div>
                          <div style={{textAlign:"right",flexShrink:0}}><div style={{fontWeight:700,fontSize:10,color:"#7e22ce"}}>RM{sv2?.price}</div><span style={{padding:"0 4px",borderRadius:20,fontSize:7,fontWeight:600,background:pc2.bg,color:pc2.tx,border:`1px solid ${pc2.br}`}}>{v.payStatus}</span></div>
                        </div>
                        {v.remark&&<div style={{marginTop:2,padding:"2px 5px",background:"#f3e8ff",borderRadius:4,fontSize:7,color:"#7e22ce"}}>💬 {v.remark}</div>}
                      </div>
                    </div>
                  );})}
                </div>
              </div>
            );}
            return<div>
              <h2 style={{margin:"0 0 10px",fontSize:16,fontWeight:700,color:"#1a1a2e"}}>Customers</h2>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:11}}>
                {[{l:"Total",v:allCustomers.length,ic:"👥",c:"#7e22ce"},{l:"Returning",v:allCustomers.filter(c=>c.count>1).length,ic:"🔄",c:"#0891b2"},{l:"New",v:allCustomers.filter(c=>c.isNew).length,ic:"🌱",c:"#16a34a"},{l:"Revenue",v:`RM${allCustomers.reduce((s,c)=>s+c.spend,0)}`,ic:"💰",c:"#d97706"}].map(s=>(
                  <div key={s.l} style={card({padding:"9px 11px"})}><div style={{fontSize:15,marginBottom:2}}>{s.ic}</div><div style={{fontSize:17,fontWeight:700,color:s.c}}>{s.v}</div><div style={{fontSize:8,color:"#9090b0",marginTop:1}}>{s.l}</div></div>
                ))}
              </div>
              <div style={{position:"relative",marginBottom:8}}>
                <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",fontSize:11,color:"#c0c0d0"}}>🔍</span>
                <input value={custSearch} onChange={e=>setCustSearch(e.target.value)} placeholder="Search name or phone..." style={{...inp,paddingLeft:28}}/>
                {custSearch&&<button onClick={()=>setCustSearch("")} style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:14,color:"#c0c0d0"}}>×</button>}
              </div>
              <div style={{display:"flex",gap:4,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
                <div style={{display:"flex",gap:3}}>
                  {[["all","All"],["vip","VIP"],["new","New"],["unpaid","Unpaid"]].map(([k,l])=>(
                    <button key={k} onClick={()=>setCustFilter(k)} style={{padding:"2px 8px",borderRadius:20,border:custFilter===k?"2px solid #9333ea":"1px solid #ede9fe",background:custFilter===k?"#f3e8ff":"#fff",color:custFilter===k?"#7e22ce":"#9090b0",fontSize:9,fontWeight:custFilter===k?700:400,cursor:"pointer"}}>{l}</button>
                  ))}
                </div>
                <select value={custSort} onChange={e=>setCustSort(e.target.value)} style={{marginLeft:"auto",padding:"2px 6px",border:"1px solid #ede9fe",borderRadius:5,fontSize:9,outline:"none",color:"#4a4a6a"}}>
                  {[["recent","Recent"],["name","Name"],["visits","Most Visits"],["spend","Highest Spend"]].map(([k,v])=><option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {filtered.map(c=>(
                  <div key={c.phone} onClick={()=>{setSelCustomer(c);setCustNoteEdit(custNotes[c.phone]||"");}} style={card({padding:"10px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:10})}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${c.isVip?"#f59e0b,#fbbf24":"#9333ea,#c084fc"})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:14,flexShrink:0}}>{c.name[0]}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:1}}>
                        <span style={{fontWeight:700,fontSize:11,color:"#1a1a2e"}}>{c.name}</span>
                        {c.isVip&&<span style={{padding:"0 4px",borderRadius:20,fontSize:7,fontWeight:700,background:"#fef9c3",color:"#854d0e",border:"1px solid #fde68a"}}>⭐VIP</span>}
                        {c.isNew&&<span style={{padding:"0 4px",borderRadius:20,fontSize:7,fontWeight:700,background:"#f0fdf4",color:"#15803d",border:"1px solid #86efac"}}>🌱New</span>}
                        {c.hasUnpaid&&<span style={{padding:"0 4px",borderRadius:20,fontSize:7,fontWeight:700,background:"#fef2f2",color:"#991b1b",border:"1px solid #fca5a5"}}>⚠️</span>}
                      </div>
                      <div style={{fontSize:9,color:"#9090b0"}}>{c.phone} · Last: <span style={{color:"#7e22ce",fontWeight:500}}>{fmtD(c.lastVisit)}</span></div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}><div style={{fontWeight:700,fontSize:11,color:"#7e22ce"}}>RM{c.spend}</div><div style={{fontSize:8,color:"#9090b0"}}>{c.count} visits</div></div>
                    <span style={{color:"#d8b4fe",fontSize:12}}>›</span>
                  </div>
                ))}
              </div>
            </div>;
          })()}

          {/* ═══ STAFF ═══ */}
          {tab==="staff"&&<div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <h2 style={{margin:0,fontSize:16,fontWeight:700,color:"#1a1a2e"}}>My Staff</h2>
              <button onClick={()=>setAddStaff(true)} style={pBtn({fontSize:11,padding:"7px 13px"})}>+ Add Staff</button>
            </div>
            {/* Month selector for stats */}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:11,padding:"7px 11px",background:"#fff",borderRadius:8,border:"1px solid #ede9fe",width:"fit-content"}}>
              <span style={{fontSize:10,color:"#9090b0",fontWeight:600}}>Stats month:</span>
              <button onClick={()=>setStaffMonth(p=>{const m=p.m-1<0?11:p.m-1;return{y:p.m-1<0?p.y-1:p.y,m};})} style={{...gBtn(),padding:"2px 7px",fontSize:10}}>←</button>
              <span style={{fontSize:11,fontWeight:600,color:"#1a1a2e",minWidth:80,textAlign:"center"}}>{MONTHS_EN[staffMonth.m]} {staffMonth.y}</span>
              <button onClick={()=>setStaffMonth(p=>{const m=p.m+1>11?0:p.m+1;return{y:p.m+1>11?p.y+1:p.y,m};})} style={{...gBtn(),padding:"2px 7px",fontSize:10}}>→</button>
            </div>
            {unassignedAll.length>0&&<div style={{background:"#fdf4ff",border:"1px solid #e9d5ff",borderRadius:8,padding:"8px 12px",marginBottom:10,display:"flex",gap:8,alignItems:"center"}}><span>⚠️</span><div style={{fontWeight:600,color:"#7e22ce",fontSize:10,flex:1}}>{unassignedAll.length} unassigned</div><button onClick={()=>setTab("bookings")} style={gBtn({fontSize:9,padding:"3px 7px"})}>Assign</button></div>}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
              {staffList.map(s=>{
                const smStr=`${staffMonth.y}-${String(staffMonth.m+1).padStart(2,"0")}`;
                const monthBks=bookings.filter(b=>b.staff===s.id&&b.status!=="cancelled"&&b.date.startsWith(smStr));
                const monthRev=monthBks.reduce((sum,b)=>sum+(svc(b.service)?.price||0),0);
                const todayLeave=leaveRecords.find(r=>r.staffId===s.id&&r.dates.includes(selectedDate));
                const myLeaves=leaveRecords.filter(r=>r.staffId===s.id);
                return(
                  <div key={s.id} style={card({padding:14})}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:9,marginBottom:10}}>
                      <div style={{width:46,height:46,borderRadius:"50%",background:s.photo?"transparent":(todayLeave?"#d1d5db":s.color),overflow:"hidden",flexShrink:0,border:"2px solid #ede9fe"}}>
                        {s.photo?<img src={s.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:18}}>{s.avatar}</div>}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:13,color:"#1a1a2e"}}>{s.name}</div>
                        <div style={{fontSize:9,color:"#9090b0"}}>{s.position}</div>
                        <div style={{fontSize:9,color:"#9090b0"}}>{s.phone}</div>
                        <span style={{padding:"1px 7px",borderRadius:20,fontSize:8,fontWeight:600,marginTop:3,display:"inline-block",...(todayLeave?{background:"#fef2f2",color:"#991b1b",border:"1px solid #fca5a5"}:{background:"#f0fdf4",color:"#15803d",border:"1px solid #86efac"})}}>{todayLeave?"On Leave":"Active"}</span>
                      </div>
                      <button onClick={()=>setEditStaff(s)} style={{...gBtn(),fontSize:9,padding:"3px 7px",flexShrink:0}}>✏️</button>
                    </div>
                    {/* Monthly stats */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                      <div style={{background:"#f8f7ff",borderRadius:6,padding:"6px 8px"}}><div style={{fontSize:12,fontWeight:700,color:"#7e22ce"}}>{monthBks.length}</div><div style={{fontSize:8,color:"#9090b0"}}>{MONTHS_EN[staffMonth.m]} Bookings</div></div>
                      <div style={{background:"#f8f7ff",borderRadius:6,padding:"6px 8px"}}><div style={{fontSize:12,fontWeight:700,color:"#7e22ce"}}>RM{monthRev}</div><div style={{fontSize:8,color:"#9090b0"}}>{MONTHS_EN[staffMonth.m]} Revenue</div></div>
                    </div>
                    {/* Skills */}
                    {s.skills?.length>0&&<div style={{marginBottom:8}}>
                      <div style={{fontSize:8,fontWeight:600,color:"#9090b0",marginBottom:3}}>Skills</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
                        {s.skills.map(sk=><span key={sk} style={{padding:"1px 5px",borderRadius:10,background:"#f3e8ff",color:"#7e22ce",fontSize:7,fontWeight:600}}>{sk}</span>)}
                      </div>
                    </div>}
                    {/* Emergency contact */}
                    {s.emergencyName&&<div style={{marginBottom:8,padding:"5px 7px",background:"#fef9c3",borderRadius:6}}>
                      <div style={{fontSize:8,fontWeight:600,color:"#92400e"}}>🚨 Emergency: {s.emergencyName}</div>
                      <div style={{fontSize:8,color:"#92400e"}}>{s.emergencyPhone}</div>
                    </div>}
                    {/* Leave records */}
                    {myLeaves.length>0&&<div style={{marginBottom:8,padding:"5px 7px",background:"#fdf4ff",borderRadius:6}}>
                      <div style={{fontSize:8,fontWeight:600,color:"#7e22ce",marginBottom:2}}>Leave Records</div>
                      {myLeaves.slice(-2).map((r,i)=><div key={i} style={{fontSize:7,color:"#7e22ce"}}>{r.dates.length===1?fmtD(r.dates[0]):`${fmtD(r.dates[0])}–${fmtD(r.dates[r.dates.length-1])}`} · {r.leaveType.toUpperCase()}{r.reason&&` · ${r.reason}`}</div>)}
                    </div>}
                    <div style={{display:"flex",flexDirection:"column",gap:4}}>
                      <button onClick={()=>setLeaveStaff(s)} style={gBtn({width:"100%",padding:"6px 0",fontSize:9,textAlign:"center"})}>📅 Mark Leave</button>
                      <button onClick={()=>setSchedStaff(s)} style={gBtn({width:"100%",padding:"6px 0",fontSize:9,textAlign:"center"})}>🕐 Edit Schedule</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>}

          {/* ═══ SERVICES ═══ */}
          {tab==="services"&&<div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:11}}>
              <h2 style={{margin:0,fontSize:16,fontWeight:700,color:"#1a1a2e"}}>Services</h2>
              <button style={pBtn({fontSize:11,padding:"7px 13px"})}>+ Add Service</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {ALL_SERVICES.map(s=>(
                <div key={s.id} style={card({padding:"10px 12px",display:"flex",alignItems:"center",gap:10})}>
                  <div style={{width:30,height:30,borderRadius:7,background:"#f3e8ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>✂️</div>
                  <div style={{flex:1}}><div style={{fontWeight:600,fontSize:11,color:"#1a1a2e"}}>{s.name}</div><div style={{fontSize:9,color:"#9090b0"}}>{s.duration} min</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontWeight:700,fontSize:12,color:"#7e22ce"}}>RM {s.price}</div><div style={{fontSize:8,color:"#9090b0"}}>per session</div></div>
                  <button style={gBtn({fontSize:9,padding:"4px 8px"})}>Edit</button>
                </div>
              ))}
            </div>
          </div>}

          {/* ═══ ANALYTICS ═══ */}
          {tab==="analytics"&&<div>
            <h2 style={{margin:"0 0 11px",fontSize:16,fontWeight:700,color:"#1a1a2e"}}>Analytics</h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10}}>
              {[{l:"This Month Revenue",v:"RM 1,840",c:"+18%"},{l:"Total Bookings",v:"38",c:"+12%"},{l:"Avg per Booking",v:"RM 120",c:"+5%"}].map(s=>(
                <div key={s.l} style={card({padding:"11px 12px"})}><div style={{fontSize:9,color:"#9090b0",marginBottom:3}}>{s.l}</div><div style={{fontSize:18,fontWeight:700,color:"#1a1a2e"}}>{s.v}</div><div style={{fontSize:9,color:"#16a34a",fontWeight:500,marginTop:2}}>{s.c} vs last month</div></div>
              ))}
            </div>
            <div style={card({padding:12,marginBottom:9})}>
              <div style={{fontWeight:600,fontSize:11,color:"#1a1a2e",marginBottom:8}}>💳 Payment Overview</div>
              <div style={{display:"flex",gap:6}}>
                {Object.entries(PC).map(([k,c])=>{const cnt=bookings.filter(b=>b.payStatus===k).length;const paid=bookings.filter(b=>b.payStatus===k).reduce((s,b)=>s+(b.amtPaid||0),0);const total=bookings.filter(b=>b.payStatus===k).reduce((s,b)=>s+(svc(b.service)?.price||0),0);return(
                  <div key={k} style={{flex:1,padding:"8px 9px",background:c.bg,border:`1px solid ${c.br}`,borderRadius:8,textAlign:"center"}}>
                    <div style={{fontSize:17,fontWeight:700,color:c.tx}}>{cnt}</div>
                    <div style={{fontSize:8,color:c.tx,fontWeight:600,marginBottom:1}}>{k}</div>
                    <div style={{fontSize:7,color:c.tx,opacity:.7}}>Paid: RM{paid}</div>
                    <div style={{fontSize:7,color:c.tx,opacity:.7}}>Total: RM{total}</div>
                  </div>
                );})}
              </div>
            </div>
            <div style={card({padding:12})}>
              <div style={{fontWeight:600,fontSize:11,color:"#1a1a2e",marginBottom:8}}>⭐ Top Services</div>
              {ALL_SERVICES.map(s=>{const cnt=bookings.filter(b=>b.service===s.id&&b.status!=="cancelled").length;const mx=Math.max(...ALL_SERVICES.map(sv=>bookings.filter(b=>b.service===sv.id&&b.status!=="cancelled").length),1);return(
                <div key={s.id} style={{marginBottom:7}}><div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#4a4a6a",marginBottom:2}}><span>{s.name}</span><span style={{fontWeight:600,color:"#7e22ce"}}>{cnt} · RM{cnt*s.price}</span></div><div style={{height:4,background:"#f3e8ff",borderRadius:2}}><div style={{height:"100%",width:`${(cnt/mx)*100}%`,background:"linear-gradient(90deg,#a855f7,#7e22ce)",borderRadius:2}}/></div></div>
              );})}
            </div>
          </div>}
        </main>
      </div>

      {/* ─── MODALS ─── */}
      <AddModal show={showAdd} onClose={()=>setShowAdd(false)} onAdd={handleAddBooking} initialDate={addDate} initialTime={addTime} leaveRecords={leaveRecords} staffList={staffList}/>
      <DetailModal booking={selBooking} onClose={()=>{setSelBooking(null);setNotifTriggered(false);}} onAccept={handleAccept} onCancel={handleCancel} onSave={handleSaveEdit} leaveRecords={leaveRecords} staffList={staffList} autoEdit={notifTriggered}/>
      <LeaveModal staffMember={leaveStaff} bookings={bookings} onClose={()=>setLeaveStaff(null)} onConfirm={handleLeave}/>
      <ScheduleModal staffMember={schedStaff} schedule={schedStaff?schedules[schedStaff.id]:null} onClose={()=>setSchedStaff(null)} onSave={handleSaveSched}/>
      {editStaff&&<StaffModal staffMember={editStaff} onClose={()=>setEditStaff(null)} onSave={handleSaveStaff} isNew={false}/>}
      {addStaff&&<StaffModal staffMember={null} onClose={()=>setAddStaff(false)} onSave={handleSaveStaff} isNew={true}/>}
      {editCustomer&&<CustomerEditModal customer={editCustomer} extraData={customerExtra[editCustomer.phone]} onClose={()=>setEditCustomer(null)} onSave={handleSaveCustomer}/>}
      <NotifPanel show={showNotif} onClose={()=>setShowNotif(false)} bookings={bookings} onSelectBooking={(b)=>{setSelBooking(b);setNotifTriggered(true);setShowNotif(false);setTab("bookings");}}/>
    </div>
  );
}
