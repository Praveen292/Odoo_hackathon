import React from 'react'

export default function KPICards({kpis={}}){
  const items = [
    {label:'Active Vehicles',value:kpis.activeVehicles},
    {label:'Available Vehicles',value:kpis.availableVehicles},
    {label:'Vehicles In Maintenance',value:kpis.inMaintenance},
    {label:'Active Trips',value:kpis.activeTrips},
  ]

  return (
    <div className="kpi-grid">
      {items.map(it=> (
        <div key={it.label} className="panel card" style={{padding:18,display:'flex',flexDirection:'column',alignItems:'center'}}>
          <div className="muted" style={{fontSize:13}}>{it.label}</div>
          <div style={{fontSize:22,fontWeight:700,marginTop:6}}>{it.value ?? '-'}</div>
          <div className="muted text-sm" style={{marginTop:6}}>▲ 4%</div>
        </div>
      ))}
    </div>
  )
}
