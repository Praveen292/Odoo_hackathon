import React, {useState} from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Table from '../components/common/Table'
import SearchBar from '../components/common/SearchBar'

const seed = Array.from({length:14}).map((_,i)=>({
	vehicle:`VH-${200+i}`, type: ['Maintenance','Repair','Toll','Parking'][i%4], date:`2026-0${(i%9)+1}-05`, amount: Math.round(50+Math.random()*120), desc:'Routine'
}))

export default function Expenses(){
	const [q,setQ] = useState('')
	const filtered = seed.filter(s => s.vehicle.toLowerCase().includes(q.toLowerCase()) || s.type.toLowerCase().includes(q.toLowerCase()))

	return (
		<DashboardLayout>
			<div className="page-header">
				<div>
					<h2>Expenses</h2>
					<div className="muted">Track operational expenses per vehicle</div>
				</div>
				<div style={{display:'flex',gap:12}}>
					<SearchBar value={q} onChange={setQ} placeholder="Search by vehicle or type" />
					<button className="btn">Add Expense</button>
				</div>
			</div>

			<div className="panel card">
				<Table columns={[{key:'vehicle',title:'Vehicle'},{key:'type',title:'Type'},{key:'date',title:'Date'},{key:'amount',title:'Amount'},{key:'desc',title:'Description'}]} data={filtered} />
			</div>
		</DashboardLayout>
	)
}

