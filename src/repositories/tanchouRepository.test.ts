import { beforeEach, describe, expect, it } from 'vitest'
import { createTanchou, deleteTanchou, listTanchous, setTanchouStarred } from './tanchouRepository'
import { createWord, listWords } from './wordRepository'

beforeEach(() => {
  window.localStorage.clear()
})

describe('tanchouRepository', () => {
  it('scopes list to the given account', async () => {
    await createTanchou('account-1', '単語帳A')
    await createTanchou('account-2', '単語帳B')

    const list = await listTanchous('account-1')
    expect(list.map((t) => t.name)).toEqual(['単語帳A'])
  })

  it('reserves visibility as private without exposing it for editing', async () => {
    const tanchou = await createTanchou('account-1', '単語帳A')
    expect(tanchou.visibility).toBe('private')
  })

  it('creates a tanchou with isStarred false by default, and can toggle it', async () => {
    const tanchou = await createTanchou('account-1', '単語帳A')
    expect(tanchou.isStarred).toBe(false)

    const starred = await setTanchouStarred(tanchou.id, true)
    expect(starred.isStarred).toBe(true)
    expect(starred.name).toBe('単語帳A')
  })

  it('cascades delete to the words belonging to the tanchou', async () => {
    const tanchou = await createTanchou('account-1', '単語帳A')
    await createWord(tanchou.id, { word: 'apple', meaning: 'りんご' })

    await deleteTanchou(tanchou.id)

    expect(await listTanchous('account-1')).toHaveLength(0)
    expect(await listWords(tanchou.id)).toHaveLength(0)
  })
})
