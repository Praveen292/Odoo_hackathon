import React from 'react'
import Table from '../common/Table'

export default function TripTable({data=[]}){
  const columns = [
    {key:'id',title:'Trip ID'},
    {key:'from',title:'From'},
    {key:'to',title:'To'},
    {key:'vehicle',title:'Vehicle'},
    {key:'driver',title:'Driver'},
    {key:'status',title:'Status'},
  ]
  return <Table columns={columns} data={data} />
}
