import { computeNiceYAxisMax, type MasteryCounts } from '@/domain/dashboardStats'
import { MASTERY_LEVELS, MASTERY_LEVEL_COLORS, MASTERY_LEVEL_ICONS, MASTERY_LEVEL_LABELS } from '@/domain/labels'
import styles from './MasteryBarChart.module.css'

const WIDTH = 320
const HEIGHT = 200
const PADDING_TOP = 28
const PADDING_BOTTOM = 40
const BAR_WIDTH = 24
const BAR_RADIUS = 4

function roundedTopBarPath(x: number, bottomY: number, topY: number, width: number, radius: number): string {
  const r = Math.max(Math.min(radius, width / 2, bottomY - topY), 0)
  if (r <= 0) {
    return `M ${x} ${bottomY} L ${x} ${topY} L ${x + width} ${topY} L ${x + width} ${bottomY} Z`
  }
  return [
    `M ${x} ${bottomY}`,
    `L ${x} ${topY + r}`,
    `Q ${x} ${topY} ${x + r} ${topY}`,
    `L ${x + width - r} ${topY}`,
    `Q ${x + width} ${topY} ${x + width} ${topY + r}`,
    `L ${x + width} ${bottomY}`,
    'Z',
  ].join(' ')
}

interface MasteryBarChartProps {
  counts: MasteryCounts
}

export function MasteryBarChart({ counts }: MasteryBarChartProps) {
  const values = MASTERY_LEVELS.map((level) => counts[level])
  const { max } = computeNiceYAxisMax(Math.max(...values))
  const plotHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM
  const baselineY = HEIGHT - PADDING_BOTTOM
  const bandWidth = WIDTH / MASTERY_LEVELS.length

  return (
    <svg
      className={styles.chart}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={MASTERY_LEVELS.map((level) => `${MASTERY_LEVEL_LABELS[level]} ${counts[level]}語`).join('、')}
    >
      <line x1={0} y1={baselineY} x2={WIDTH} y2={baselineY} className={styles.baseline} />
      {MASTERY_LEVELS.map((level, i) => {
        const count = counts[level]
        const barHeight = max > 0 ? (count / max) * plotHeight : 0
        const topY = baselineY - barHeight
        const x = i * bandWidth + (bandWidth - BAR_WIDTH) / 2
        return (
          <g key={level} className={styles.barGroup}>
            <title>{`${MASTERY_LEVEL_LABELS[level]}: ${count}語`}</title>
            <path
              d={roundedTopBarPath(x, baselineY, topY, BAR_WIDTH, BAR_RADIUS)}
              fill={MASTERY_LEVEL_COLORS[level]}
              className={styles.bar}
            />
            <text x={x + BAR_WIDTH / 2} y={topY - 8} textAnchor="middle" className={styles.valueLabel}>
              {count}
            </text>
            <text x={x + BAR_WIDTH / 2} y={baselineY + 20} textAnchor="middle" className={styles.categoryIcon}>
              {MASTERY_LEVEL_ICONS[level]}
            </text>
            <text x={x + BAR_WIDTH / 2} y={baselineY + 34} textAnchor="middle" className={styles.categoryLabel}>
              {MASTERY_LEVEL_LABELS[level]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
