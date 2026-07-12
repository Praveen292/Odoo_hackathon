import React from 'react'
import Table from '../../components/common/Table'

export default function RecentTrips({data=[]}){
  return (
    <div>
      <h4 className="muted">Recent Trips</h4>
      <Table columns={[{key:'id',title:'Trip ID'},{key:'vehicle',title:'Vehicle'},{key:'driver',title:'Driver'},{key:'status',title:'Status'},{key:'revenue',title:'Revenue'}]} data={data} />
    </div>
  )
}
