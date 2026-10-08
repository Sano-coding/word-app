import { useMemo, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { computeNiceYAxisMax } from '@/domain/dashboardStats'
import { MASTERY_LEVELS, MASTERY_LEVEL_COLORS, MASTERY_LEVEL_ICONS, MASTERY_LEVEL_LABELS } from '@/domain/labels'
import type { MasterySnapshot, MasteryLevel } from '@/types'
import styles from './MasteryLineChart.module.css'

const WIDTH = 320
const HEIGHT = 180
const PADDING_LEFT = 30
const PADDING_RIGHT = 8
const PADDING_TOP = 12
const PADDING_BOTTOM = 24
const PLOT_WIDTH = WIDTH - PADDING_LEFT - PADDING_RIGHT
const PLOT_HEIGHT = HEIGHT - PADDING_TOP - PADDING_BOTTOM
const MAX_X_LABELS = 5

function formatShortDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-')
  return `${Number(m)}/${Number(d)}`
}

function formatFullDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${y}年${Number(m)}月${Number(d)}日`
}

function pickLabelIndices(count: number): number[] {
  if (count <= MAX_X_LABELS) {
    return Array.from({ length: count }, (_, i) => i)
  }
  const step = (count - 1) / (MAX_X_LABELS - 1)
  const indices = new Set<number>()
  for (let i = 0; i < MAX_X_LABELS; i++) {
    indices.add(Math.round(i * step))
  }
  return Array.from(indices).sort((a, b) => a - b)
}

const LEVEL_KEYS: Record<MasteryLevel, keyof Pick<MasterySnapshot, 'notMemorized' | 'partiallyMemorized' | 'memorized'>> = {
  not_memorized: 'notMemorized',
  partially_memorized: 'partiallyMemorized',
  memorized: 'memorized',
}

interface MasteryLineChartProps {
  data: MasterySnapshot[]
}

export function MasteryLineChart({ data }: MasteryLineChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const n = data.length

  const maxValue = useMemo(
    () => Math.max(0, ...data.flatMap((d) => [d.notMemorized, d.partiallyMemorized, d.memorized])),
    [data],
  )
  const { max: yMax, step: yStep } = computeNiceYAxisMax(maxValue)
  const yTicks = useMemo(() => {
    const ticks: number[] = []
    for (let v = 0; v <= yMax + 1e-9; v += yStep) ticks.push(Math.round(v))
    return ticks
  }, [yMax, yStep])

  const xAt = (i: number) => (n <= 1 ? PADDING_LEFT + PLOT_WIDTH / 2 : PADDING_LEFT + (i / (n - 1)) * PLOT_WIDTH)
  const yAt = (v: number) => PADDING_TOP + PLOT_HEIGHT - (yMax > 0 ? (v / yMax) * PLOT_HEIGHT : 0)

  const linePaths = MASTERY_LEVELS.map((level) => {
    const key = LEVEL_KEYS[level]
    const points = data.map((d, i) => `${xAt(i)},${yAt(d[key])}`)
    return { level, d: points.length > 0 ? `M ${points.join(' L ')}` : '' }
  })

  const labelIndices = pickLabelIndices(n)

  function handlePointerMove(event: ReactPointerEvent<SVGRectElement>) {
    if (n === 0) return
    const svg = event.currentTarget.ownerSVGElement
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const relativeX = ((event.clientX - rect.left) / rect.width) * WIDTH
    const ratio = n <= 1 ? 0 : (relativeX - PADDING_LEFT) / PLOT_WIDTH
    const index = Math.min(n - 1, Math.max(0, Math.round(ratio * (n - 1))))
    setHoveredIndex(index)
  }

  const hovered = hoveredIndex !== null ? data[hoveredIndex] : null
  const tooltipLeftPercent = hoveredIndex !== null ? Math.min(82, Math.max(18, (xAt(hoveredIndex) / WIDTH) * 100)) : 0

  return (
    <div className={styles.wrap}>
      <ul className={styles.legend}>
        {MASTERY_LEVELS.map((level) => (
          <li key={level} className={styles.legendItem}>
            <span className={styles.legendSwatch} style={{ background: MASTERY_LEVEL_COLORS[level] }} />
            <span className={styles.legendIcon}>{MASTERY_LEVEL_ICONS[level]}</span>
            {MASTERY_LEVEL_LABELS[level]}
          </li>
        ))}
      </ul>

      <div className={styles.chartArea}>
        {hovered && (
          <div className={styles.tooltip} style={{ left: `${tooltipLeftPercent}%` }}>
            <div className={styles.tooltipDate}>{formatFullDate(hovered.date)}</div>
            {MASTERY_LEVELS.map((level) => (
              <div key={level} className={styles.tooltipRow}>
                <span className={styles.tooltipKey} style={{ background: MASTERY_LEVEL_COLORS[level] }} />
                <span className={styles.tooltipLabel}>{MASTERY_LEVEL_LABELS[level]}</span>
                <span className={styles.tooltipValue}>{hovered[LEVEL_KEYS[level]]}語</span>
              </div>
            ))}
          </div>
        )}

        <svg className={styles.chart} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="定着度ごとの単語数の推移">
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={PADDING_LEFT}
                y1={yAt(tick)}
                x2={WIDTH - PADDING_RIGHT}
                y2={yAt(tick)}
                className={styles.gridline}
              />
              <text x={PADDING_LEFT - 6} y={yAt(tick)} dy="0.32em" textAnchor="end" className={styles.axisLabel}>
                {tick}
              </text>
            </g>
          ))}

          {labelIndices.map((i) => (
            <text key={i} x={xAt(i)} y={HEIGHT - 6} textAnchor="middle" className={styles.axisLabel}>
              {formatShortDate(data[i].date)}
            </text>
          ))}

          {hoveredIndex !== null && (
            <line
              x1={xAt(hoveredIndex)}
              y1={PADDING_TOP}
              x2={xAt(hoveredIndex)}
              y2={PADDING_TOP + PLOT_HEIGHT}
              className={styles.crosshair}
            />
          )}

          {linePaths.map(
            ({ level, d }) => d && <path key={level} d={d} fill="none" stroke={MASTERY_LEVEL_COLORS[level]} className={styles.line} />,
          )}

          {MASTERY_LEVELS.map((level) => {
            const key = LEVEL_KEYS[level]
            const lastIndex = n - 1
            if (lastIndex < 0) return null
            return (
              <circle
                key={level}
                cx={xAt(lastIndex)}
                cy={yAt(data[lastIndex][key])}
                r={4}
                fill={MASTERY_LEVEL_COLORS[level]}
                className={styles.endDot}
              />
            )
          })}

          {hoveredIndex !== null &&
            MASTERY_LEVELS.map((level) => {
              const key = LEVEL_KEYS[level]
              return (
                <circle
                  key={level}
                  cx={xAt(hoveredIndex)}
                  cy={yAt(data[hoveredIndex][key])}
                  r={4}
                  fill={MASTERY_LEVEL_COLORS[level]}
                  className={styles.hoverDot}
                />
              )
            })}

          <rect
            x={PADDING_LEFT}
            y={PADDING_TOP}
            width={PLOT_WIDTH}
            height={PLOT_HEIGHT}
            fill="transparent"
            className={styles.overlay}
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setHoveredIndex(null)}
          />
        </svg>
      </div>

      {n < 2 && <p className={styles.hint}>学習を続けると、ここに日ごとの推移が表示されます。</p>}
    </div>
  )
}
