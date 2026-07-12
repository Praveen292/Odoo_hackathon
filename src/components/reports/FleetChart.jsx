import React from 'react'
import { Pie } from 'react-chartjs-2'

export default function FleetChart({data}){
  const chartData = {labels:['Trucks','Vans','Cars'],datasets:[{data:data|| [45,25,30],backgroundColor:['#0b63d6','#06b6d4','#10b981']}]}
  return <Pie data={chartData} />
}
