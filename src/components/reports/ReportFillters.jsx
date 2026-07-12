import React from 'react'

export default function ReportFillters(){
  return (
    <div style={{display:'flex',gap:8}}>
      <input className="search-input" placeholder="Region" />
      <input className="search-input" placeholder="Vehicle Type" />
    </div>
  )
}
