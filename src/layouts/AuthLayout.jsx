import React from 'react'
import '../../styles/global.css'

export default function AuthLayout({children}){
	return (
		<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:24,background:'var(--bg)'}}>
			<div style={{width:'100%',maxWidth:420}} className="panel">
				{children}
			</div>
		</div>
	)
}

