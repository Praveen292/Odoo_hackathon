import React from 'react'

export default function StatusBadge({status}){
	const cls = status?.toLowerCase().includes('in shop')? 'inshop': status?.toLowerCase().includes('retired')? 'retired': status?.toLowerCase().includes('on trip')? 'ontrip':'available'
	return <span className={`badge ${cls}`}>{status}</span>
}

