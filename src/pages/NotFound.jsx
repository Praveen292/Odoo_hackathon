import React from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'

export default function NotFound(){
	return (
		<DashboardLayout>
			<div style={{padding:60,textAlign:'center'}}>
				<h1>404</h1>
				<div className="muted">Page not found</div>
				<div style={{height:20}} />
				<a href="/" className="btn">Return Home</a>
			</div>
		</DashboardLayout>
	)
}
