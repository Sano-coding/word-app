import { describe, expect, it } from 'vitest'
import { toAccount } from './accountRepository'

describe('accountRepository row mapping', () => {
  it('converts a snake_case DB row into the camelCase Account type', () => {
    const account = toAccount({
      id: 'a1',
      nickname: 'Sano',
      icon_type: 'preset',
      icon_value: 'cat',
      created_at: '2026-01-01T00:00:00.000Z',
      status_message: '英検準1級を目指して勉強中！',
      theme_color: 'blue',
      dashboard_public: false,
    })

    expect(account).toEqual({
      id: 'a1',
      nickname: 'Sano',
      iconType: 'preset',
      iconValue: 'cat',
      createdAt: '2026-01-01T00:00:00.000Z',
      statusMessage: '英検準1級を目指して勉強中！',
      themeColor: 'blue',
      dashboardPublic: false,
    })
  })
})
