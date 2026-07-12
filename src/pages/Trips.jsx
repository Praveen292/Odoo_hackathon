import React, {useState} from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import SearchBar from '../components/common/SearchBar'
import TripTable from '../components/trips/TripTable'
import TripDetails from '../components/trips/TripDetails'

const seedTrips = Array.from({length:12}).map((_,i)=>({
	id:`TR-${1000+i}`,
	from:'Depot A',
	to:'Client X',
	vehicle:`VH-${200+i}`,
	driver:`Driver ${i+1}`,
	status: i%3===0? 'Completed': i%3===1? 'Dispatched':'Draft'
}))

export default function Trips(){
	const [q,setQ] = useState('')
	const [data] = useState(seedTrips)
	const [selected,setSelected] = useState(null)
	const filtered = data.filter(t => t.id.toLowerCase().includes(q.toLowerCase()) || t.vehicle.toLowerCase().includes(q.toLowerCase()))

	return (
		<DashboardLayout>
			<div className="page-header">
				<div>
					<h2>Trips</h2>
					<div className="muted">Manage trip lifecycle: draft → dispatched → completed</div>
				</div>
				<div style={{display:'flex',gap:12}}>
					<SearchBar value={q} onChange={setQ} placeholder="Search by trip, vehicle or driver" />
					<button className="btn">New Trip</button>
				</div>
			</div>

			<div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16}}>
				<div className="panel card">
					<TripTable data={filtered} />
				</div>
				<div>
					<TripDetails trip={selected || data[0]} />
				</div>
			</div>
		</DashboardLayout>
	)
}

