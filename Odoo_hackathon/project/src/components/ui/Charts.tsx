import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const isDark = () => document.documentElement.classList.contains('dark');

function getChartColors() {
  const dark = isDark();
  return {
    text: dark ? '#cbd5e1' : '#475569',
    grid: dark ? '#1e293b' : '#e2e8f0',
  };
}

export function BarChart({ labels, data, label, color = '#2563eb', height = 200 }: {
  labels: string[];
  data: number[];
  label: string;
  color?: string;
  height?: number;
}) {
  const colors = useMemo(getChartColors, []);
  return (
    <div style={{ height }}>
      <Bar
        data={{
          labels,
          datasets: [{
            label,
            data,
            backgroundColor: color,
            borderRadius: 6,
            barThickness: 'flex' as const,
            maxBarThickness: 40,
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: colors.text }, grid: { display: false } },
            y: { ticks: { color: colors.text }, grid: { color: colors.grid } },
          },
        }}
      />
    </div>
  );
}

export function LineChart({ labels, datasets, height = 200 }: {
  labels: string[];
  datasets: { label: string; data: number[]; color: string }[];
  height?: number;
}) {
  const colors = useMemo(getChartColors, []);
  return (
    <div style={{ height }}>
      <Line
        data={{
          labels,
          datasets: datasets.map((d) => ({
            label: d.label,
            data: d.data,
            borderColor: d.color,
            backgroundColor: d.color + '20',
            fill: true,
            tension: 0.3,
            pointRadius: 3,
            pointHoverRadius: 5,
          })),
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: colors.text } } },
          scales: {
            x: { ticks: { color: colors.text }, grid: { display: false } },
            y: { ticks: { color: colors.text }, grid: { color: colors.grid } },
          },
        }}
      />
    </div>
  );
}

export function DoughnutChart({ labels, data, colors, height = 200 }: {
  labels: string[];
  data: number[];
  colors: string[];
  height?: number;
}) {
  return (
    <div style={{ height }}>
      <Doughnut
        data={{
          labels,
          datasets: [{
            data,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: isDark() ? '#1e293b' : '#fff',
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: getChartColors().text, padding: 12, usePointStyle: true } },
          },
          cutout: '60%',
        }}
      />
    </div>
  );
}
