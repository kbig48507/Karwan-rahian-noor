import {NextRequest,NextResponse} from 'next/server';

export async function POST(request:NextRequest){
 const base=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!base||!key)return NextResponse.json({error:'Set SUPABASE_SERVICE_ROLE_KEY in .env.local to enable portal invitations.'},{status:503});
 const bearer=request.headers.get('authorization')||'';
 if(!bearer.startsWith('Bearer '))return NextResponse.json({error:'Sign in required.'},{status:401});
 const headers={apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'};
 const userResponse=await fetch(`${base}/auth/v1/user`,{headers:{apikey:key,Authorization:bearer},cache:'no-store'});
 if(!userResponse.ok)return NextResponse.json({error:'Session expired.'},{status:401});
 const user=await userResponse.json();
 const staffResponse=await fetch(`${base}/rest/v1/krn_staff_profiles?select=role,active&user_id=eq.${encodeURIComponent(user.id)}&limit=1`,{headers,cache:'no-store'});
 const staff=await staffResponse.json();
 if(!staffResponse.ok||!Array.isArray(staff)||!staff[0]?.active||!['admin','manager'].includes(staff[0].role))return NextResponse.json({error:'Admin or manager access required.'},{status:403});
 const input=await request.json().catch(()=>({}));
 const table=input.kind==='agent'?'krn_agents':input.kind==='pilgrim'?'krn_pilgrims':'';
 if(!table||!/^[-0-9a-f]{36}$/i.test(String(input.id||'')))return NextResponse.json({error:'Invalid account.'},{status:400});
 const rowResponse=await fetch(`${base}/rest/v1/${table}?select=*&id=eq.${input.id}&limit=1`,{headers,cache:'no-store'});
 const rows=await rowResponse.json();const row=rows?.[0];
 if(!rowResponse.ok||!row)return NextResponse.json({error:'Account not found.'},{status:404});
 if(row.auth_user_id)return NextResponse.json({error:'Portal account already linked.'},{status:409});
 if(!row.email||!row.phone)return NextResponse.json({error:'Email and WhatsApp number are required for an invitation.'},{status:400});
 const appUrl=process.env.NEXT_PUBLIC_APP_URL;
 if(!appUrl||!/^https:\/\//.test(appUrl)&&!/^http:\/\/localhost(?::\d+)?$/.test(appUrl))return NextResponse.json({error:'Set NEXT_PUBLIC_APP_URL to the approved HTTPS portal URL (or http://localhost:3000 locally).'}, {status:503});
 const generated=await fetch(`${base}/auth/v1/admin/generate_link`,{method:'POST',headers,body:JSON.stringify({type:'invite',email:row.email,redirect_to:appUrl})});
 const invite=await generated.json();
 if(!generated.ok||!invite.action_link||!invite.id)return NextResponse.json({error:invite.msg||invite.message||'Could not generate invitation.'},{status:400});
 const updated=await fetch(`${base}/rest/v1/${table}?id=eq.${input.id}&auth_user_id=is.null`,{method:'PATCH',headers:{...headers,Prefer:'return=representation'},body:JSON.stringify({auth_user_id:invite.id})});
 const linked=await updated.json();
 if(!updated.ok||!linked?.length)return NextResponse.json({error:'Invitation created, but account linking failed. Contact support before retrying.'},{status:409});
 return NextResponse.json({phone:row.phone,name:row.name||row.full_name,link:invite.action_link,site:appUrl});
}
