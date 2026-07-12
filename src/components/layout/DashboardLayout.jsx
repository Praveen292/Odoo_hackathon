import React, {useState} from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import '../../styles/global.css'

export default function DashboardLayout({children}){
	const [open, setOpen] = useState(false)
	return (
		<div className="app-shell">
			<Sidebar open={open} />
			<div style={{flex:1}}>
				<Navbar onToggleSidebar={()=>setOpen(s=>!s)} />
				<main className="main-content">{children}</main>
			</div>
		</div>
	)
}

