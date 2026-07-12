import React from 'react'
import { Line } from 'react-chartjs-2'

export default function ROIChart(){
  const chartData = {labels:['Jan','Feb','Mar','Apr','May','Jun'],datasets:[{label:'ROI',data:[0.12,0.1,0.15,0.18,0.14,0.2],borderColor:'#0b63d6'}]}
  return <Line data={chartData} />
}
