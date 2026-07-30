import { describe, expect, it } from 'vitest'
import { zhText } from '../../app/utils/seo'

describe('zhText', () => {
  it('keeps Chinese text', () => {
    const value = '在国中时期创下五十次失恋纪录的著名坏学生樱木花道，进入了县立湘北高中。'
    expect(zhText(value)).toBe(value)
  })

  it('drops Japanese text', () => {
    expect(zhText('明るく前向きな性格と、「やってみよう！」の一言で行動する好奇心の持ち主。')).toBe(
      undefined,
    )
    expect(zhText('カタカナダケノブンショウデス')).toBe(undefined)
  })

  it('keeps Chinese text quoting a Japanese title', () => {
    const value =
      '本作改编自川原砾创作的轻小说《ソードアート・オンライン》，讲述玩家被困在虚拟世界中，必须通关死亡游戏才能返回现实的故事，动画由知名工作室制作并于二零一二年七月开始播出，全二十五话。'
    expect(zhText(value)).toBe(value)
  })

  it('drops Japanese text that is kanji heavy', () => {
    expect(zhText('機動戦士ガンダム第08MS小隊、地球連邦軍の陸戦部隊を描いた物語')).toBe(undefined)
  })

  it('drops text without Han characters', () => {
    expect(zhText('A visual novel developed by an independent studio.')).toBe(undefined)
  })

  it('drops empty values', () => {
    expect(zhText('')).toBe(undefined)
    expect(zhText(null)).toBe(undefined)
    expect(zhText(undefined)).toBe(undefined)
  })
})
