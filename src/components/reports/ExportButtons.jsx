import React from 'react'

export default function ExportButtons(){
  return (
    <div style={{display:'flex',gap:8}}>
      <button className="btn secondary">Export CSV</button>
      <button className="btn secondary">Export PDF</button>
    </div>
  )
}
