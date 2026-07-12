import React from 'react'

export default function TripDetails({trip}){
  if(!trip) return <div className="empty-state">No trip selected</div>
  return (
    <div className="panel card">
      <h3>Trip {trip.id}</h3>
      <div className="muted">{trip.from} → {trip.to}</div>
      <div style={{height:12}} />
      <div>Vehicle: {trip.vehicle}</div>
      <div>Driver: {trip.driver}</div>
      <div>Status: {trip.status}</div>
    </div>
  )
}
