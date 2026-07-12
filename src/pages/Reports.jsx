import React, {useState} from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import FleetChart from '../components/reports/FleetChart'
import ROIChart from '../components/reports/ROIChart'
import ExportButtons from '../components/reports/ExportButtons'
import ReportFillters from '../components/reports/ReportFillters'

export default function Reports(){
	const [filters] = useState({})
	return (
		<DashboardLayout>
			<div className="page-header">
				<div>
					<h2>Reports</h2>
					<div className="muted">Analytics and KPIs — exportable</div>
				</div>
				<div style={{display:'flex',gap:12}}>
					<ReportFillters />
					<ExportButtons />
				</div>
			</div>

			<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
				<div className="panel card">
					<h3>Fleet Composition</h3>
					<FleetChart />
				</div>
				<div className="panel card">
					<h3>Vehicle ROI</h3>
					<ROIChart />
				</div>
			</div>
		</DashboardLayout>
	)
}

