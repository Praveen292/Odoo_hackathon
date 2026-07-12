import React from 'react'

export default function DriverCard({driver}){
  return (
    <div className="panel card" style={{display:'flex',gap:12,alignItems:'center'}}>
      <div style={{width:44,height:44,borderRadius:999,background:'linear-gradient(135deg,var(--primary),var(--primary-600))',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}>{(driver?.name||'D').split(' ').map(s=>s[0]).slice(0,2).join('')}</div>
      <div>
        <div style={{fontWeight:700}}>{driver?.name}</div>
        <div className="muted text-sm">{driver?.license}</div>
      </div>
    </div>
  )
}
