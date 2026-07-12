import React from 'react'
import { Bar } from 'react-chartjs-2'

export default function FuelChart({data}){
  const chartData = {labels:['Jan','Feb','Mar','Apr','May','Jun'],datasets:[{label:'Fuel Cost',data: data|| [400,320,360,420,480,510],backgroundColor:'#06b6d4'}]}
  return <Bar data={chartData} />
}
