'use client';
export default function WhatsAppAction({phone,message,label='Open WhatsApp to send'}:{phone?:string|null;message:string;label?:string}){
 const digits=String(phone||'').replace(/\D/g,'').replace(/^0/,'92');
 if(!digits)return <small>Add a WhatsApp number to send a message.</small>;
 return <a className="secondary whatsapp-action" href={`https://wa.me/${digits}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">{label}</a>;
}
