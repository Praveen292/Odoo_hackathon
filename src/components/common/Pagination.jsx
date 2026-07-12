import React from 'react'

export default function Pagination({page, total, onChange}){
	const pages = Math.max(1, Math.ceil(total/10))
	return (
		<div style={{display:'flex',gap:8,alignItems:'center'}}>
			<button className="btn secondary" onClick={()=>onChange(Math.max(1,page-1))}>Prev</button>
			<div className="muted">Page {page} / {pages}</div>
			<button className="btn secondary" onClick={()=>onChange(Math.min(pages,page+1))}>Next</button>
		</div>
	)
}

