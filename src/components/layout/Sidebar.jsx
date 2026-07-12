import React from 'react'
import { NavLink } from 'react-router-dom'
import '../../styles/sidebar.css'

const items = [
	{to:'/',label:'Dashboard'},
	{to:'/vehicles',label:'Vehicles'},
	{to:'/drivers',label:'Drivers'},
	{to:'/trips',label:'Trips'},
	{to:'/maintenance',label:'Maintenance'},
	{to:'/fuel',label:'Fuel Logs'},
	{to:'/expenses',label:'Expenses'},
	{to:'/reports',label:'Reports'},
	{to:'/settings',label:'Settings'},
]

export default function Sidebar({open}){
	return (
		<aside className={`sidebar ${open? 'open':''}`}>
			<div className="brand">TransitOps</div>
			{items.map(i=> (
				<NavLink key={i.to} to={i.to} className={({isActive})=> `nav-item ${isActive? 'active':''}`} end>
					<span>{i.label}</span>
				</NavLink>
			))}
			<div className="nav-footer">v0.1 • Demo</div>
		</aside>
	)
}
