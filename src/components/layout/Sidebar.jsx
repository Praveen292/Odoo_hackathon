import React from 'react'
import { NavLink } from 'react-router-dom'
import '../../styles/sidebar.css'
import { Home, Truck, Users, MapPin, Wrench, Droplet, FileText, Settings } from 'lucide-react'

const items = [
	{to:'/',label:'Dashboard',icon:Home},
	{to:'/vehicles',label:'Vehicles',icon:Truck},
	{to:'/drivers',label:'Drivers',icon:Users},
	{to:'/trips',label:'Trips',icon:MapPin},
	{to:'/maintenance',label:'Maintenance',icon:Wrench},
	{to:'/fuel',label:'Fuel Logs',icon:Droplet},
	{to:'/expenses',label:'Expenses',icon:FileText},
	{to:'/reports',label:'Reports',icon:FileText},
	{to:'/settings',label:'Settings',icon:Settings},
]

export default function Sidebar({open}){
	return (
		<aside className={`sidebar ${open? 'open':''}`}>
			<div className="brand">TransitOps</div>
			{items.map(i=> (
				<NavLink key={i.to} to={i.to} className={({isActive})=> `nav-item ${isActive? 'active':''}`} end>
					<i style={{display:'inline-flex',width:20}}><i><i /></i></i>
					<i style={{width:18,display:'inline-flex',marginRight:8}}>{React.createElement(i.icon, {size:16})}</i>
					<span>{i.label}</span>
				</NavLink>
			))}
			<div className="nav-footer">v0.1 • Demo</div>
		</aside>
	)
}
