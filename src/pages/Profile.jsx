import React from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'

export default function Profile(){
	return (
		<DashboardLayout>
			<div className="page-header">
				<div>
					<h2>Profile</h2>
					<div className="muted">Your account details and preferences</div>
				</div>
				<div>
					<button className="btn">Edit Profile</button>
				</div>
			</div>

			<div className="panel card" style={{display:'flex',gap:16}}>
				<div style={{width:140}}>
					<div style={{width:120,height:120,borderRadius:999,background:'linear-gradient(135deg,var(--primary),var(--primary-600))',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:28}}>FM</div>
				</div>
				<div>
					<h3>Fleet Manager</h3>
					<div className="muted">fleet@example.com</div>
					<div style={{height:12}} />
					<div><strong>Role:</strong> Fleet Manager</div>
					<div><strong>Region:</strong> North</div>
				</div>
			</div>
		</DashboardLayout>
	)
}

