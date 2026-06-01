import { useMemo, useState } from 'react'

import type { MeasurementHistory } from '../api/childrenApi'

type MetricKey = 'weight_kg' | 'height_cm' | 'bmi'

type Metric = {
  key: MetricKey
  label: string
  unit: string
  color: string
  bgColor: string
  getValue: (item: MeasurementHistory) => number
}

type ChartPoint = {
  item: MeasurementHistory
  x: number
  values: Record<MetricKey, number>
}

const metrics: Metric[] = [
  {
    key: 'weight_kg',
    label: 'Weight',
    unit: 'kg',
    color: '#2563eb',
    bgColor: 'bg-blue-600',
    getValue: (item) => item.weight_kg,
  },
  {
    key: 'height_cm',
    label: 'Height',
    unit: 'cm',
    color: '#16a34a',
    bgColor: 'bg-green-600',
    getValue: (item) => item.height_cm,
  },
  {
    key: 'bmi',
    label: 'BMI',
    unit: '',
    color: '#9333ea',
    bgColor: 'bg-purple-600',
    getValue: (item) => item.bmi,
  },
]

const chartWidth = 920
const chartHeight = 320
const padding = {
  top: 28,
  right: 24,
  bottom: 56,
  left: 48,
}
const plotWidth = chartWidth - padding.left - padding.right
const plotHeight = chartHeight - padding.top - padding.bottom

export function GrowthTrendChart({ history }: { history: MeasurementHistory[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const chartData = useMemo(() => {
    const orderedHistory = [...history].sort(
      (a, b) =>
        new Date(a.measurement_date).getTime() -
        new Date(b.measurement_date).getTime(),
    )

    const ranges = metrics.reduce(
      (rangesByMetric, metric) => {
        const values = orderedHistory.map(metric.getValue)
        const min = Math.min(...values)
        const max = Math.max(...values)
        const spread = max - min
        const paddingValue = spread > 0 ? spread * 0.16 : Math.max(max * 0.08, 1)

        rangesByMetric[metric.key] = {
          min: min - paddingValue,
          max: max + paddingValue,
        }

        return rangesByMetric
      },
      {} as Record<MetricKey, { min: number; max: number }>,
    )

    const points = orderedHistory.map((item, index) => {
      const x =
        orderedHistory.length === 1
          ? padding.left + plotWidth / 2
          : padding.left + (index / (orderedHistory.length - 1)) * plotWidth

      return {
        item,
        x,
        values: metrics.reduce(
          (valuesByMetric, metric) => {
            const range = ranges[metric.key]
            const value = metric.getValue(item)
            const ratio =
              range.max === range.min
                ? 0.5
                : (value - range.min) / (range.max - range.min)

            valuesByMetric[metric.key] =
              padding.top + plotHeight - ratio * plotHeight

            return valuesByMetric
          },
          {} as Record<MetricKey, number>,
        ),
      } satisfies ChartPoint
    })

    return {
      orderedHistory,
      points,
      paths: metrics.map((metric) => ({
        metric,
        path: createSmoothPath(points, metric.key),
      })),
    }
  }, [history])

  const activePoint =
    activeIndex === null ? null : chartData.points[activeIndex] ?? null

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (chartData.points.length === 0) {
      return
    }

    const bounds = event.currentTarget.getBoundingClientRect()
    const relativeX = ((event.clientX - bounds.left) / bounds.width) * chartWidth
    const nearestIndex = chartData.points.reduce((nearest, point, index) => {
      const nearestDistance = Math.abs(chartData.points[nearest].x - relativeX)
      const pointDistance = Math.abs(point.x - relativeX)

      return pointDistance < nearestDistance ? index : nearest
    }, 0)

    setActiveIndex(nearestIndex)
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-700">Growth Analytics</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            Growth trend visualization
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Chronological weight, height, and BMI progression from recorded measurements.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {metrics.map((metric) => (
            <div
              key={metric.key}
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600"
            >
              <span className={`h-2.5 w-2.5 rounded-full ${metric.bgColor}`} />
              {metric.label}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-[300px] min-w-[680px] rounded-lg bg-slate-50/70"
          role="img"
          aria-label="Growth trend chart showing weight, height, and BMI progression"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setActiveIndex(null)}
        >
          <defs>
            <linearGradient id="growth-chart-fade" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          <rect
            x={padding.left}
            y={padding.top}
            width={plotWidth}
            height={plotHeight}
            rx="12"
            fill="url(#growth-chart-fade)"
          />

          {[0, 1, 2, 3].map((line) => {
            const y = padding.top + (line / 3) * plotHeight

            return (
              <line
                key={line}
                x1={padding.left}
                x2={chartWidth - padding.right}
                y1={y}
                y2={y}
                stroke="#cbd5e1"
                strokeDasharray="4 8"
                strokeWidth="1"
              />
            )
          })}

          {chartData.paths.map(({ metric, path }) =>
            path ? (
              <path
                key={metric.key}
                d={path}
                fill="none"
                stroke={metric.color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
                className="drop-shadow-sm transition-all duration-500"
              />
            ) : null,
          )}

          {chartData.points.map((point) =>
            metrics.map((metric) => (
              <circle
                key={`${point.item.measurement_id}-${metric.key}`}
                cx={point.x}
                cy={point.values[metric.key]}
                r={activePoint?.item.measurement_id === point.item.measurement_id ? 6 : 4}
                fill="#ffffff"
                stroke={metric.color}
                strokeWidth="3"
                className="transition-all duration-200"
              />
            )),
          )}

          {activePoint ? (
            <g>
              <line
                x1={activePoint.x}
                x2={activePoint.x}
                y1={padding.top}
                y2={padding.top + plotHeight}
                stroke="#64748b"
                strokeDasharray="5 6"
                strokeWidth="1.5"
              />
              <Tooltip point={activePoint} />
            </g>
          ) : null}

          {chartData.points.map((point, index) => (
            <text
              key={point.item.measurement_id}
              x={point.x}
              y={chartHeight - 22}
              textAnchor="middle"
              className="fill-slate-500 text-[12px] font-medium"
            >
              {formatShortDate(point.item.measurement_date, index, chartData.points.length)}
            </text>
          ))}
        </svg>
      </div>

      {history.length < 2 ? (
        <p className="mt-3 text-xs font-medium text-slate-500">
          Add another measurement to make growth trends easier to compare.
        </p>
      ) : null}
    </section>
  )
}

function Tooltip({ point }: { point: ChartPoint }) {
  const tooltipWidth = 196
  const tooltipHeight = 118
  const tooltipX =
    point.x + tooltipWidth + 16 > chartWidth
      ? point.x - tooltipWidth - 16
      : point.x + 16
  const tooltipY = Math.max(
    padding.top + 8,
    Math.min(
      padding.top + plotHeight - tooltipHeight - 8,
      Math.min(...Object.values(point.values)) - 28,
    ),
  )

  return (
    <foreignObject
      x={tooltipX}
      y={tooltipY}
      width={tooltipWidth}
      height={tooltipHeight}
      className="pointer-events-none"
    >
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
        <p className="text-xs font-semibold text-slate-950">
          {formatFullDate(point.item.measurement_date)}
        </p>
        <div className="mt-2 space-y-1.5">
          {metrics.map((metric) => (
            <div
              key={metric.key}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <span className="inline-flex items-center gap-2 font-medium text-slate-600">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: metric.color }}
                />
                {metric.label}
              </span>
              <span className="font-semibold text-slate-950">
                {formatMetricValue(metric.getValue(point.item), metric.unit)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </foreignObject>
  )
}

function createSmoothPath(points: ChartPoint[], key: MetricKey) {
  if (points.length < 2) {
    return ''
  }

  return points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.values[key]}`
    }

    const previous = points[index - 1]
    const midX = (previous.x + point.x) / 2

    return `${path} C ${midX} ${previous.values[key]}, ${midX} ${point.values[key]}, ${point.x} ${point.values[key]}`
  }, '')
}

function formatMetricValue(value: number, unit: string) {
  const formatted = Number.isInteger(value) ? value.toString() : value.toFixed(2)

  return unit ? `${formatted} ${unit}` : formatted
}

function formatShortDate(date: string, index: number, total: number) {
  if (total > 6 && index % 2 !== 0 && index !== total - 1) {
    return ''
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(date))
}

function formatFullDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}
