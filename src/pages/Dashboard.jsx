import React, {useEffect, useState} from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Card from '../components/common/Card'
import {fetchKPIs, fetchRecentTrips, fetchRecentMaint} from '../services/api'
import Table from '../components/common/Table'
import Loader from '../components/common/Loader'
import '../styles/global.css'
import TripsChart from '../components/dashboard/TripsChart'
import KPICards from '../components/dashboard/KPICards'
import RecentTrips from '../components/dashboard/RecentTrips'

function KPI({label,value}){
	return (
		<div className="kpi-card panel">
			<div>
				<div className="label muted">{label}</div>
				<div className="value">{value}</div>
			</div>
			<div style={{fontSize:12,color:'var(--muted)'}}>▲ 4%</div>
		</div>
	)
}

export default function Dashboard(){
	const [loading,setLoading] = useState(true)
	const [kpis,setKpis] = useState(null)
	const [trips,setTrips] = useState([])
	const [maint,setMaint] = useState([])

	useEffect(()=>{
		let mounted=true
		;(async ()=>{
			setLoading(true)
			const a = await fetchKPIs()
			const b = await fetchRecentTrips()
			const c = await fetchRecentMaint()
			if(!mounted) return
			setKpis(a); setTrips(b); setMaint(c); setLoading(false)
		})()
		return ()=> mounted=false
	},[])

	if(loading) return <DashboardLayout><div style={{padding:40,display:'flex',justifyContent:'center'}}><Loader/></div></DashboardLayout>

	return (
		<DashboardLayout>
			<div className="page-header">
				<div>
					<h2>Dashboard</h2>
					<div className="muted">Overview of fleet operations</div>
				</div>
			</div>

			<KPICards kpis={kpis} />

			<div style={{height:18}} />

			<div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16}}>
				<div className="panel card">
					<h3>Trips Per Month</h3>
					<div style={{height:260}}>
						<TripsChart data={{labels:['Jan','Feb','Mar','Apr','May','Jun'],dataset:[10,14,18,16,22,20]}} />
					</div>
					<div style={{height:12}} />
					<RecentTrips data={trips} />
				</div>

				<div className="panel card">
					<h3>Maintenance</h3>
					<div style={{height:120}} className="chart-placeholder">Maintenance Overview</div>
					<div style={{height:12}} />
					<Table columns={[{key:'id',title:'ID'},{key:'vehicle',title:'Vehicle'},{key:'desc',title:'Description'},{key:'cost',title:'Cost'},{key:'status',title:'Status'}]} data={maint} />
				</div>
			</div>

		</DashboardLayout>
	)
}

