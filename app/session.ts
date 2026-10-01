'use client';

type Session = {access_token:string;refresh_token:string;expires_at:number;expires_in?:number};
let pending:Promise<string>|null=null;

export const savedSession=():Session|null=>{
 try {const value=sessionStorage.getItem('kn_session');return value?JSON.parse(value) as Session:null} catch {return null}
};

export const clearSession=()=>{sessionStorage.removeItem('kn_session');window.dispatchEvent(new Event('kn_session_changed'))};

export async function validToken(endpoint:string,anonKey:string,force=false):Promise<string>{
 const session=savedSession();
 if(!session?.refresh_token){clearSession();throw new Error('Session expired. Please sign in again.')}
 if(!force&&session.expires_at>Date.now()/1000+60)return session.access_token;
 if(pending)return pending;
 pending=(async()=>{
  const r=await fetch(`${endpoint}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{apikey:anonKey,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:session.refresh_token})});
  const data=await r.json().catch(()=>({}));
  if(!r.ok||!data.access_token){clearSession();throw new Error('Session expired. Please sign in again.')}
  sessionStorage.setItem('kn_session',JSON.stringify({...data,expires_at:Math.floor(Date.now()/1000)+data.expires_in}));
  window.dispatchEvent(new Event('kn_session_changed'));
  return data.access_token as string;
 })().finally(()=>{pending=null});
 return pending;
}

export async function supabaseApi(endpoint:string,anonKey:string,path:string,options:RequestInit={}):Promise<any>{
 const send=async(force=false)=>fetch(endpoint+path,{...options,headers:{apikey:anonKey,Authorization:`Bearer ${await validToken(endpoint,anonKey,force)}`,'Content-Type':'application/json',...options.headers}});
 let response=await send();
 if(response.status===401)response=await send(true);
 if(!response.ok){const body=await response.json().catch(()=>({}));throw new Error(body.message||body.error_description||`Request failed (${response.status})`)}
 return response.status===204?[]:response.json();
}
