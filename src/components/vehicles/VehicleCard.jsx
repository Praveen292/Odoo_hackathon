import React from 'react'

export default function VehicleCard({vehicle}){
  return (
    <div className="panel card" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div>
        <div style={{fontWeight:700}}>{vehicle?.name || vehicle?.registration || 'Vehicle'}</div>
        <div className="muted text-sm">{vehicle?.model}</div>
      </div>
      <div className="badge available">{vehicle?.status || 'Available'}</div>
    </div>
  )
}
