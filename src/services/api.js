// Minimal mock API for frontend demo. Replace with real endpoints later.
const wait = (ms=300)=> new Promise(r=>setTimeout(r,ms))

const seed = {
	kpis: {
		activeVehicles: 12,
		availableVehicles: 7,
		inMaintenance: 3,
		activeTrips: 5,
		pendingTrips: 2,
		driversOnDuty: 6,
		fleetUtilization: 72,
	},
	recentTrips: Array.from({length:6}).map((_,i)=>({
		id:`TR-${1000+i}`,
		vehicle:`VH-${200+i}`,
		driver:`Driver ${i+1}`,
		from:'Depot A',
		to:'Client X',
		status: i%3===0? 'Completed': i%3===1? 'Dispatched':'Draft',
		revenue: Math.round(1200 + Math.random()*400)
	})),
	recentMaint: Array.from({length:4}).map((_,i)=>({
		id:`MNT-${300+i}`,
		vehicle:`VH-${210+i}`,
		desc:'Routine check',
		cost: Math.round(300+Math.random()*600),
		status: i%2===0? 'Active':'Completed'
	}))
}

export async function fetchKPIs(){
	await wait(400)
	return seed.kpis
}

export async function fetchRecentTrips(){
	await wait(400)
	return seed.recentTrips
}

export async function fetchRecentMaint(){
	await wait(400)
	return seed.recentMaint
}

export default {fetchKPIs, fetchRecentTrips, fetchRecentMaint}
