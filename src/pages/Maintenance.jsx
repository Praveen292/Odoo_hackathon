import React, {useState} from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import SearchBar from '../components/common/SearchBar'
import Table from '../components/common/Table'

const seed = Array.from({length:8}).map((_,i)=>({
	id:`MNT-${300+i}`,
	vehicle:`VH-${210+i}`,
	desc:'Routine check',
	cost: Math.round(200+Math.random()*800),
	status: i%2===0? 'Active':'Completed'
}))

export default function Maintenance(){
	const [q,setQ] = useState('')
	const filtered = seed.filter(s => s.id.toLowerCase().includes(q.toLowerCase()) || s.vehicle.toLowerCase().includes(q.toLowerCase()))

	return (
		<DashboardLayout>
			<div className="page-header">
				<div>
					<h2>Maintenance</h2>
					<div className="muted">Schedule and track vehicle maintenance</div>
				</div>
				<div style={{display:'flex',gap:12}}>
					<SearchBar value={q} onChange={setQ} placeholder="Search maintenance..." />
					<button className="btn">Create Maintenance</button>
				</div>
			</div>

			<div className="panel card">
				<Table columns={[{key:'id',title:'ID'},{key:'vehicle',title:'Vehicle'},{key:'desc',title:'Description'},{key:'cost',title:'Cost'},{key:'status',title:'Status'}]} data={filtered} />
			</div>
		</DashboardLayout>
	)
}

