import React from 'react'
import Table from '../common/Table'

export default function DriverTable({data=[]}){
  const columns = [
    {key:'name',title:'Name'},
    {key:'license',title:'License Number'},
    {key:'category',title:'Category'},
    {key:'expiry',title:'Expiry'},
    {key:'status',title:'Status'},
  ]
  return <Table columns={columns} data={data} />
}
