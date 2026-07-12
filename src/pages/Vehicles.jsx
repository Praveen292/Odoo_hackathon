import React, {useState} from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import SearchBar from '../components/common/SearchBar'
import VehicleTable from '../components/vehicles/VehicleTable'

const seedVehicles = Array.from({length:15}).map((_,i)=>({
	registration:`VH-${200+i}`,
	name:`Truck ${i+1}`,
	model: ['Volvo','Mercedes','Toyota'][i%3],
	capacity: `${(5+i)%10} ton`,
	status: i%7===0? 'In Shop': i%5===0? 'Retired':'Available'
}))

export default function Vehicles(){
	const [q,setQ] = useState('')
	const [data] = useState(seedVehicles)
	const filtered = data.filter(v => v.name.toLowerCase().includes(q.toLowerCase()) || v.registration.toLowerCase().includes(q.toLowerCase()))

	return (
		<DashboardLayout>
			<div className="page-header">
				<div>
					<h2>Vehicles</h2>
					<div className="muted">Vehicle registry — manage and audit fleet</div>
				</div>
				<div style={{display:'flex',gap:12}}>
					<SearchBar value={q} onChange={setQ} placeholder="Search by reg, name or model" />
					<button className="btn">Add Vehicle</button>
				</div>
			</div>

			<div className="panel card">
				<VehicleTable data={filtered} />
			</div>
		</DashboardLayout>
	)
}

