import React from 'react'
import Table from '../common/Table'

export default function VehicleTable({data=[]}){
  const columns = [
    {key:'registration',title:'Registration'},
    {key:'name',title:'Name'},
    {key:'model',title:'Model'},
    {key:'capacity',title:'Max Load'},
    {key:'status',title:'Status'},
  ]
  return <Table columns={columns} data={data} />
}
