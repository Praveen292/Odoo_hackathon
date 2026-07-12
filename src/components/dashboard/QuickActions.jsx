import React from 'react'

export default function QuickActions(){
  return (
    <div style={{display:'flex',gap:12}}>
      <button className="btn">New Trip</button>
      <button className="btn secondary">New Vehicle</button>
      <button className="btn secondary">New Driver</button>
    </div>
  )
}
