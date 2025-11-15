export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
  }[]
}

export function generateChartUrl(type: 'line' | 'bar' | 'pie', data: ChartData, title: string): string {
  const chartConfig = {
    type,
    data: {
      labels: data.labels,
      datasets: data.datasets.map(dataset => ({
        ...dataset,
        backgroundColor: dataset.backgroundColor || 'rgba(88, 101, 242, 0.5)',
        borderColor: dataset.borderColor || 'rgba(88, 101, 242, 1)',
        borderWidth: 2,
      })),
    },
    options: {
      title: {
        display: true,
        text: title,
        fontSize: 16,
      },
      legend: {
        display: true,
      },
      scales: type !== 'pie' ? {
        yAxes: [{
          ticks: {
            beginAtZero: true,
          },
        }],
      } : undefined,
    },
  }

  const encodedConfig = encodeURIComponent(JSON.stringify(chartConfig))
  return `https://quickchart.io/chart?c=${encodedConfig}&width=600&height=400&backgroundColor=white`
}

export function generateAsciiChart(data: number[], labels: string[], maxWidth: number = 20): string {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  let chart = '```\n'
  
  for (let i = 0; i < data.length; i++) {
    const value = data[i]
    const normalized = ((value - min) / range) * maxWidth
    const bars = '█'.repeat(Math.round(normalized))
    const label = labels[i].padEnd(15)
    chart += `${label} ${bars} ${value}\n`
  }
  
  chart += '```'
  return chart
}
