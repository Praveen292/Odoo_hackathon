import React from 'react'
import '../../styles/navbar.css'

export default function Navbar({onToggleSidebar}){
	return (
		<div className="topbar">
			<div className="left">
				<button className="btn secondary" onClick={onToggleSidebar}>☰</button>
				<div className="logo">TransitOps</div>
				<div style={{width:12}} />
				<div className="muted small">Logistics • Operations</div>
			</div>

			<div className="right">
				<div className="search">
					<input className="search-input" placeholder="Search vehicles, drivers, trips..." />
				</div>
				<div className="notif">
					<button className="btn secondary">Notifications</button>
					<div className="dot" />
				</div>
				<div className="avatar">FM</div>
			</div>
		</div>
	)
}
