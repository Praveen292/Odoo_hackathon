import React, {useState} from 'react'

export default function DriverForm({initial={},onSave}){
  const [name,setName] = useState(initial.name||'')
  const [license,setLicense] = useState(initial.license||'')

  function submit(e){e.preventDefault(); onSave?.({name,license})}

  return (
    <form onSubmit={submit} style={{display:'grid',gap:10}}>
      <label>Name <input className="search-input" value={name} onChange={e=>setName(e.target.value)} /></label>
      <label>License <input className="search-input" value={license} onChange={e=>setLicense(e.target.value)} /></label>
      <div style={{display:'flex',justifyContent:'flex-end'}}><button className="btn" type="submit">Save</button></div>
    </form>
  )
}
