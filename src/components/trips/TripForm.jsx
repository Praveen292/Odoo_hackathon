import React, {useState} from 'react'

export default function TripForm({initial={},onSave}){
  const [from,setFrom] = useState(initial.from||'')
  const [to,setTo] = useState(initial.to||'')

  function submit(e){e.preventDefault(); onSave?.({from,to})}

  return (
    <form onSubmit={submit} style={{display:'grid',gap:10}}>
      <label>From <input className="search-input" value={from} onChange={e=>setFrom(e.target.value)} /></label>
      <label>To <input className="search-input" value={to} onChange={e=>setTo(e.target.value)} /></label>
      <div style={{display:'flex',justifyContent:'flex-end'}}><button className="btn" type="submit">Save</button></div>
    </form>
  )
}
