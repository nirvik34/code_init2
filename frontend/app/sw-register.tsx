"use client"

import { useEffect } from 'react'

export default function SWRegister(){
  useEffect(()=>{
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (!reg) {
          navigator.serviceWorker.register('/sw.js').catch(()=>{})
        }
      })
    }
  }, [])
  return null
}
