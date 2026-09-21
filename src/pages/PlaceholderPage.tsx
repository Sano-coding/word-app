import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { routes } from '@/routes'

export default function PlaceholderPage({ label }: { label: string }) {
  const navigate = useNavigate()
  const { tanchouId } = useParams<{ tanchouId: string }>()

  return (
    <div className="page">
      <p>{label} は次のマイルストーンで実装予定です。</p>
      {tanchouId && (
        <Button variant="secondary" onClick={() => navigate(routes.submenu(tanchouId))}>
          ← サブメニューへ戻る
        </Button>
      )}
    </div>
  )
}
