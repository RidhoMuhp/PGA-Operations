"use client";

import { useState } from "react";
import { mockReports } from "@/data/mockReports";
import ReportStatusBadge from "@/components/reports/ReportStatusBadge";
import ReportDetail from "@/components/reports/ReportDetail";
import { Report, ReportStatus } from "@/types/report";

export default function ApprovalsPage(){
 const [rows,setRows]=useState(mockReports.map(r=>({...r})));
 const [selected,setSelected]=useState<Report|null>(null);
 const [revision,setRevision]=useState(false);
 const [revisionFor,setRevisionFor]=useState<Report|null>(null);
 const [notes,setNotes]=useState("");
 const update=(id:string,status:ReportStatus,notesValue?:string)=>setRows(v=>v.map(r=>r.id===id?{...r,status,notes:notesValue??r.notes}:r));
 const approve=(r:Report)=>update(r.id,"approved");
 const revise=(r:Report)=>update(r.id,"revision_requested",notes.trim()||"Mohon lengkapi data pendukung dan periksa kembali nilai laporan.");
 const eligible=rows.filter(r=>["submitted","under_review","approved","revision_requested"].includes(r.status));
 return <div className="space-y-5">
  <div><p className="text-sm text-slate-500">Central Approval</p><h2 className="mt-1 text-xl font-bold">Approval Laporan</h2><p className="mt-1 text-sm text-slate-500">Tinjau laporan sebelum diserahterimakan.</p></div>
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Laporan</th><th className="px-5 py-3">Departemen</th><th className="px-5 py-3">Pengirim</th><th className="px-5 py-3">Tanggal</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Aksi</th></tr></thead><tbody className="divide-y">{eligible.map(r=><tr key={r.id} className="hover:bg-slate-50"><td className="px-5 py-3"><p className="font-medium">{r.reportName}</p><p className="mt-1 text-xs text-slate-500">{r.reportNumber}</p></td><td className="px-5 py-3">{r.department}</td><td className="px-5 py-3">{r.submittedBy}</td><td className="px-5 py-3">{r.reportDate}</td><td className="px-5 py-3"><ReportStatusBadge status={r.status}/></td><td className="px-5 py-3"><div className="flex gap-2">{r.status==="approved"?(<button onClick={()=>update(r.id,"collected")} className="rounded-lg border border-violet-200 px-2.5 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-50">Mark Collected</button>):r.status==="revision_requested"?(<button onClick={()=>setSelected(r)} className="rounded-lg border px-2.5 py-1.5 text-xs font-semibold">Lihat Detail</button>):(<><button onClick={()=>approve(r)} className="rounded-lg bg-[#247f58] px-2.5 py-1.5 text-xs font-semibold text-white">Approve</button><button onClick={()=>{setRevisionFor(r);setRevision(true)}} className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700">Minta Revisi</button></>)}</div></td></tr>)}</tbody></table></div></div>
  {selected&&<ReportDetail report={selected} onClose={()=>setSelected(null)} />}
  {revision&&revisionFor&&<div className="fixed inset-0 z-[60] flex items-center justify-center p-4"><button className="absolute inset-0 bg-slate-950/40" onClick={()=>setRevision(false)} aria-label="Tutup"/><div className="relative w-full max-w-md rounded-xl bg-white shadow-xl"><div className="border-b px-5 py-4"><h3 className="font-bold">Catatan Revisi</h3><p className="mt-1 text-xs text-slate-500">{revisionFor.reportNumber}</p></div><div className="p-5"><textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={5} className="w-full rounded-lg border border-slate-300 p-3 text-sm" placeholder="Jelaskan bagian yang perlu diperbaiki..."/></div><div className="flex justify-end gap-2 border-t px-5 py-3"><button onClick={()=>setRevision(false)} className="rounded-lg border px-4 py-2 text-sm">Batal</button><button onClick={()=>{revise(revisionFor);setRevision(false);setNotes("");}} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white">Kirim Revisi</button></div></div></div>}
 </div>;
}
