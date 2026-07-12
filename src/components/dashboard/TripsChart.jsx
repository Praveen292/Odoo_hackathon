import React from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function TripsChart({data}){
  const labels = data?.labels || ['Jan','Feb','Mar','Apr','May','Jun']
  const dataset = data?.dataset || [12,18,14,22,26,20]

  const chartData = {
    labels,
    datasets:[{label:'Trips',data:dataset,fill:true,backgroundColor:'rgba(11,99,214,0.08)',borderColor:'rgba(11,99,214,0.9)',tension:0.3}]
  }

  return <Line data={chartData} options={{responsive:true,plugins:{legend:{display:false}}}} />
}
