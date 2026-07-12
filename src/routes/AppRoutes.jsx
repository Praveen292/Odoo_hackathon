import React from 'react'
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import Dashboard from '../pages/Dashboard'
import Login from '../pages/Login'
import Vehicles from '../pages/Vehicles'
import Drivers from '../pages/Drivers'
import Trips from '../pages/Trips'
import Maintenance from '../pages/Maintenance'
import FuelLogs from '../pages/FuelLogs'
import Expenses from '../pages/Expenses'
import Reports from '../pages/Reports'
import Settings from '../pages/Settings'

function RequireAuth({children}){
	const token = localStorage.getItem('transit_token')
	if(!token) return <Navigate to="/login" replace />
	return children
}

export default function AppRoutes(){
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<Login/>} />
				<Route path="/" element={<RequireAuth><Dashboard/></RequireAuth>} />
				<Route path="/vehicles" element={<RequireAuth><Vehicles/></RequireAuth>} />
				<Route path="/drivers" element={<RequireAuth><Drivers/></RequireAuth>} />
				<Route path="/trips" element={<RequireAuth><Trips/></RequireAuth>} />
				<Route path="/maintenance" element={<RequireAuth><Maintenance/></RequireAuth>} />
				<Route path="/fuel" element={<RequireAuth><FuelLogs/></RequireAuth>} />
				<Route path="/expenses" element={<RequireAuth><Expenses/></RequireAuth>} />
				<Route path="/reports" element={<RequireAuth><Reports/></RequireAuth>} />
				<Route path="/settings" element={<RequireAuth><Settings/></RequireAuth>} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	)
}
