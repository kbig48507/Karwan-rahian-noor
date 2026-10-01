'use client';
import {useState} from 'react';
import {validToken} from './session';

type Fields=Record<string,string>;
declare global {interface Window {Tesseract?:{createWorker:(language:string)=>Promise<{recognize:(file:File|HTMLCanvasElement)=>Promise<{data:{text:string}}>;terminate:()=>Promise<void>}>}}}

function mrzDate(raw:string):string{
 if(!/^\d{6}$/.test(raw))return '';
 const year=Number(raw.slice(0,2));const century=year>new Date().getFullYear()%100+10?1900:2000;
 const date=`${century+year}-${raw.slice(2,4)}-${raw.slice(4,6)}`;
 return Number.isNaN(Date.parse(date))?'':date;
}

export function parsePassport(text:string):Fields{
 const lines=text.toUpperCase().split(/\r?\n/).map(x=>x.replace(/[^A-Z0-9<]/g,'')).filter(x=>x.length>=35);
 for(let i=0;i<lines.length-1;i++){
  const first=lines[i],second=lines[i+1];
  if(!first.startsWith('P<')||second.length<43)continue;
  const names=first.slice(5).split('<<');
  const surname=names[0]?.replace(/</g,' ').trim()||'';
  const given=names[1]?.replace(/</g,' ').trim()||'';
  return {full_name:[given,surname].filter(Boolean).join(' '),passport_number:second.slice(0,9).replace(/</g,'').trim(),nationality:second.slice(10,13),date_of_birth:mrzDate(second.slice(13,19)),passport_expiry:mrzDate(second.slice(21,27))};
 }
 return {};
}

export default function PassportScan({onExtract}:{onExtract:(fields:Fields)=>void}){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[selected,setSelected]=useState<File|null>(null);
 const scan=async(file?:File)=>{
  if(!file)return;
  if(!file.type.startsWith('image/')){setMessage('Choose a passport photo (JPG or PNG).');return}
  setSelected(file);
  setBusy(true);setMessage('Reading passport on this device…');
  try{
   if(!window.Tesseract){await new Promise<void>((resolve,reject)=>{const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js';script.onload=()=>resolve();script.onerror=()=>reject(new Error('OCR download failed. Check internet connection.'));document.head.appendChild(script)})}
   if(!window.Tesseract)throw new Error('OCR unavailable.');
   const worker=await window.Tesseract.createWorker('eng');
   let fields:Fields={};try{const image=await createImageBitmap(file);const canvas=document.createElement('canvas');canvas.width=Math.min(2400,image.width*2);canvas.height=Math.round(canvas.width*0.32);const ctx=canvas.getContext('2d');if(ctx){ctx.filter='grayscale(1) contrast(2.2)';ctx.drawImage(image,0,image.height*0.68,image.width,image.height*0.32,0,0,canvas.width,canvas.height);fields=parsePassport((await worker.recognize(canvas)).data.text)}image.close();if(!fields.passport_number)fields=parsePassport((await worker.recognize(file)).data.text)}finally{await worker.terminate()}
   if(!fields.passport_number)throw new Error('Passport MRZ could not be read. Retake a clear photo showing the two lines at the bottom.');
   onExtract(fields);setMessage('Passport details filled. Check every field against the document.');
  }catch(error){setMessage((error as Error).message)}finally{setBusy(false)}
 };
 const scanAi=async()=>{if(!selected)return;setBusy(true);setMessage('AI reading the passport. The photo will be sent to the configured AI provider…');try{const token=await validToken(process.env.NEXT_PUBLIC_SUPABASE_URL||'',process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'');const body=new FormData();body.append('image',selected);const response=await fetch('/api/passport-ai',{method:'POST',headers:{Authorization:`Bearer ${token}`},body});const data=await response.json();if(!response.ok)throw new Error(data.error||'AI scanning failed');onExtract(Object.fromEntries(Object.entries(data.fields as Fields).filter(([,value])=>value)));setMessage('AI fields filled. Verify all data against the passport before saving.')}catch(e){setMessage((e as Error).message)}finally{setBusy(false)}};
 return <div className="passport-scan"><label>Scan passport photo <input type="file" accept="image/*" capture="environment" disabled={busy} onChange={e=>{void scan(e.target.files?.[0]);e.target.value=''}}/></label>{selected&&<button type="button" className="secondary" disabled={busy} onClick={()=>void scanAi()}>Try AI scan (optional)</button>}<small>{message||'Local OCR first reads the two bottom lines. AI scan sends this photo to the configured provider and may incur API charges. Review every field before saving.'}</small></div>;
}
