import {NextRequest,NextResponse} from 'next/server';

export async function POST(request:NextRequest){
 const apiKey=process.env.OPENAI_API_KEY;
 const base=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!apiKey)return NextResponse.json({error:'AI scanning is optional. Set OPENAI_API_KEY on the server to enable it.'},{status:503});
 if(!base||!anon)return NextResponse.json({error:'Supabase is not configured.'},{status:503});
 const bearer=request.headers.get('authorization')||'';
 if(!bearer.startsWith('Bearer '))return NextResponse.json({error:'Sign in required.'},{status:401});
 const userResponse=await fetch(`${base}/auth/v1/user`,{headers:{apikey:anon,Authorization:bearer},cache:'no-store'});
 if(!userResponse.ok)return NextResponse.json({error:'Session expired.'},{status:401});
 const user=await userResponse.json();
 const roleResponse=await fetch(`${base}/rest/v1/krn_staff_profiles?select=role,active&user_id=eq.${encodeURIComponent(user.id)}&limit=1`,{headers:{apikey:anon,Authorization:bearer},cache:'no-store'});
 const staff=await roleResponse.json();
 if(!roleResponse.ok||!staff?.[0]?.active||!['admin','manager','sales','visa'].includes(staff[0].role))return NextResponse.json({error:'Staff access required.'},{status:403});
 const form=await request.formData();const file=form.get('image');
 if(!(file instanceof File)||!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>8*1024*1024)return NextResponse.json({error:'Upload a JPG, PNG or WebP image under 8 MB.'},{status:400});
 const encoded=Buffer.from(await file.arrayBuffer()).toString('base64');
 const keys=['full_name','father_name','passport_number','nationality','date_of_birth','passport_issue','passport_expiry','national_id','address'];
 const schema={type:'object',properties:Object.fromEntries(keys.map(key=>[key,{type:'string'}])),required:keys,additionalProperties:false};
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),45000);
 try{
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',signal:controller.signal,headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_PASSPORT_MODEL||'gpt-4.1-mini',store:false,input:[{role:'user',content:[{type:'input_text',text:'Transcribe visible fields from this passport. Return empty string for anything not clearly visible. Never guess. Dates must be YYYY-MM-DD. Do not infer a national ID, father name or address from MRZ; only return them if printed explicitly. Full name should be in document order.'},{type:'input_image',image_url:`data:${file.type};base64,${encoded}`,detail:'high'}]}],text:{format:{type:'json_schema',name:'passport_fields',strict:true,schema}}})});
  const data=await response.json();
  if(!response.ok)return NextResponse.json({error:data.error?.message||'AI scanning failed.'},{status:502});
  const output=data.output?.flatMap((part:{content?:Array<{type:string;text?:string}>})=>part.content||[]).find((part:{type:string})=>part.type==='output_text')?.text;
  if(!output)return NextResponse.json({error:'No passport details were returned. Enter them manually.'},{status:422});
  const parsed=JSON.parse(output) as Record<string,string>;
  const fields=Object.fromEntries(keys.map(key=>[key,String(parsed[key]||'').slice(0,200)]));
  for(const key of ['date_of_birth','passport_issue','passport_expiry'])if(fields[key]&&!/^\d{4}-\d{2}-\d{2}$/.test(fields[key]))fields[key]='';
  return NextResponse.json({fields});
 }catch{return NextResponse.json({error:'AI request timed out or could not be completed.'},{status:502})}finally{clearTimeout(timer)}
}
