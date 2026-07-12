import React, {useState} from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import FuelChart from '../components/dashboard/FuelChart'
import Table from '../components/common/Table'
import SearchBar from '../components/common/SearchBar'

const seed = Array.from({length:12}).map((_,i)=>({
	date:`2026-0${(i%9)+1}-12`, vehicle:`VH-${200+i}`, trip:`TR-${1000+i}`, liters:Math.round(50+Math.random()*80), cost: Math.round(60+Math.random()*120)
}))

export default function FuelLogs(){
	const [q,setQ] = useState('')
	const filtered = seed.filter(s => s.vehicle.toLowerCase().includes(q.toLowerCase()) || s.trip.toLowerCase().includes(q.toLowerCase()))

	return (
		<DashboardLayout>
			<div className="page-header">
				<div>
					<h2>Fuel Logs</h2>
					<div className="muted">Track fuel purchases and efficiency</div>
				</div>
				<div style={{display:'flex',gap:12}}>
					<SearchBar value={q} onChange={setQ} placeholder="Search by vehicle or trip" />
					<button className="btn">Add Fuel</button>
				</div>
			</div>

			<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
				<div className="panel card">
					<FuelChart />
				</div>
				<div className="panel card">
					<Table columns={[{key:'date',title:'Date'},{key:'vehicle',title:'Vehicle'},{key:'trip',title:'Trip'},{key:'liters',title:'Liters'},{key:'cost',title:'Cost'}]} data={filtered} />
				</div>
			</div>
		</DashboardLayout>
	)
}

