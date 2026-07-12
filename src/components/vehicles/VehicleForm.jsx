import React, {useState} from 'react'

export default function VehicleForm({initial={},onSave}){
  const [registration,setRegistration] = useState(initial.registration||'')
  const [name,setName] = useState(initial.name||'')

  function submit(e){e.preventDefault(); onSave?.({registration,name})}

  return (
    <form onSubmit={submit} style={{display:'grid',gap:10}}>
      <label>Registration <input className="search-input" value={registration} onChange={e=>setRegistration(e.target.value)} /></label>
      <label>Name <input className="search-input" value={name} onChange={e=>setName(e.target.value)} /></label>
      <div style={{display:'flex',justifyContent:'flex-end'}}><button className="btn" type="submit">Save</button></div>
    </form>
  )
}
