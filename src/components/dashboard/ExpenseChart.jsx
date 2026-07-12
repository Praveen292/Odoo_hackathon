import React from 'react'
import { Line } from 'react-chartjs-2'

export default function ExpenseChart({data}){
  const chartData = {labels:['Jan','Feb','Mar','Apr','May','Jun'],datasets:[{label:'Expense',data: data|| [1200,900,1100,1300,1250,1400],borderColor:'#ef4444',backgroundColor:'rgba(239,68,68,0.06)'}]}
  return <Line data={chartData} />
}
