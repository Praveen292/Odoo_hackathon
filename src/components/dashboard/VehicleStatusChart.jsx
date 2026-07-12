import React from 'react'
import { Doughnut } from 'react-chartjs-2'

export default function VehicleStatusChart({data}){
  const chartData = {
    labels:['Available','On Trip','In Shop','Retired'],
    datasets:[{data: data || [60,20,15,5], backgroundColor:['#10b981','#0b63d6','#f59e0b','#ef4444']}]
  }
  return <Doughnut data={chartData} />
}
