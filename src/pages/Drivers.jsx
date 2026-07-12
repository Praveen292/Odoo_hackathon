import React, {useState} from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import SearchBar from '../components/common/SearchBar'
import DriverTable from '../components/drivers/DriverTable'

const seedDrivers = Array.from({length:20}).map((_,i)=>({
	name:`Driver ${i+1}`,
	license:`LIC-${3000+i}`,
	category: ['C1','B','A'][i%3],
	expiry: `2027-${(i%12)+1}-15`,
	status: i%8===0? 'Suspended': i%6===0? 'On Trip':'Available'
}))

export default function Drivers(){
	const [q,setQ] = useState('')
	const [data] = useState(seedDrivers)
	const filtered = data.filter(d => d.name.toLowerCase().includes(q.toLowerCase()) || d.license.toLowerCase().includes(q.toLowerCase()))

	return (
		<DashboardLayout>
			<div className="page-header">
				<div>
					<h2>Drivers</h2>
					<div className="muted">Manage driver records, licenses and statuses</div>
				</div>
				<div style={{display:'flex',gap:12}}>
					<SearchBar value={q} onChange={setQ} placeholder="Search drivers or license" />
					<button className="btn">Add Driver</button>
				</div>
			</div>

			<div className="panel card">
				<DriverTable data={filtered} />
			</div>
		</DashboardLayout>
	)
}

