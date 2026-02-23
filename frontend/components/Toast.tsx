"use client"
import {useEffect} from "react"

export default function Toast({toast,onClose}:{toast:{type:string;message:string}|null,onClose:()=>void}){
  useEffect(()=>{
    if(!toast) return
    const t = setTimeout(()=>onClose(),3000)
    return ()=>clearTimeout(t)
  },[toast])

  if(!toast) return null
  return (
    <div className={`fixed top-6 right-6 z-50`}> 
      <div className={`px-4 py-2 rounded shadow-lg text-sm ${toast.type==='success'? 'bg-emerald-500 text-white':'bg-rose-500 text-white'}`}>
        {toast.message}
      </div>
    </div>
  )
}
