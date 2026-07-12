import React from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'

export default function Settings(){
	return (
		<DashboardLayout>
			<div className="page-header">
				<div>
					<h2>Settings</h2>
					<div className="muted">Application configuration and RBAC</div>
				</div>
				<div>
					<button className="btn">Save Settings</button>
				</div>
			</div>

			<div className="panel card">
				<h3>General</h3>
				<div style={{display:'grid',gap:10}}>
					<label>Company Name <input className="search-input" defaultValue="TransitOps Inc" /></label>
					<label>Timezone <input className="search-input" defaultValue="UTC" /></label>
				</div>
			</div>
		</DashboardLayout>
	)
}

