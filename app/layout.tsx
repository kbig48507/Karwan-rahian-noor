import type { Metadata } from 'next';
import Pwa from './pwa';
import './globals.css';
export const metadata: Metadata = {title:'Karwan Rahiyaan Noor | Operations',description:'Travel agency management',manifest:'/manifest.webmanifest',icons:{icon:'/icon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}<Pwa/></body></html>}
