import React from 'react'
import '../../styles/navbar.css'
import logo from '../../assets/logo/transitops-logo.svg'
import { Bell } from 'lucide-react'

function useTheme(){
	const toggle = ()=>{
		const root = document.documentElement
		const isDark = root.classList.toggle('dark')
		localStorage.setItem('transit_theme', isDark? 'dark':'light')
	}
	return {toggle}
}

export default function Navbar({onToggleSidebar}){
	const {toggle} = useTheme()
	return (
		<div className="topbar">
			<div className="left">
				<button className="btn secondary" onClick={onToggleSidebar}>☰</button>
				<img src={logo} alt="logo" style={{height:34}} />
				<div style={{width:12}} />
				<div className="muted small">Logistics • Operations</div>
			</div>

			<div className="right">
				<div className="search">
					<input className="search-input" placeholder="Search vehicles, drivers, trips..." />
				</div>
				<div className="notif" style={{position:'relative'}}>
					<button className="btn secondary" style={{display:'inline-flex',alignItems:'center'}}><Bell size={16} /></button>
					<div className="dot" />
				</div>
				<button className="btn secondary" onClick={toggle}>Theme</button>
				<div className="avatar">FM</div>
			</div>
		</div>
	)
}
