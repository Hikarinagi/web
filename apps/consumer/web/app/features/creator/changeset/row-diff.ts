import {
  AGE_RATING_CN,
  BOOK_VARIANT_KIND_CN,
  GALGAME_EDITION_KIND_CN,
  RELEASE_STATUS_CN,
} from '@hikarinagi/shared'

export interface RowDiffColumn {
  key: string
  format?: (value: unknown) => string | number | null
}

export interface RowDiffSpec {
  name: string
  empty: string
  columns: RowDiffColumn[]
}

const tax = (value: unknown) => (value === true ? '含税' : value === false ? '不含税' : null)
const label = (labels: Record<string, string>) => (value: unknown) =>
  typeof value === 'string' ? (labels[value] ?? value) : null

export const ROW_DIFF: Record<string, RowDiffSpec> = {
  prices: {
    name: 'version',
    empty: '（无版本名）',
    columns: [{ key: 'amount' }, { key: 'currency' }, { key: 'tax_included', format: tax }],
  },
  editions: {
    name: 'title',
    empty: '（无版本名）',
    columns: [
      { key: 'kind', format: label(GALGAME_EDITION_KIND_CN) },
      { key: 'jan' },
      { key: 'product_code' },
      { key: 'platform' },
      { key: 'price' },
      { key: 'currency' },
      { key: 'tax_included', format: tax },
      { key: 'release_date' },
      { key: 'release_status', format: label(RELEASE_STATUS_CN) },
      { key: 'age_rating', format: label(AGE_RATING_CN) },
    ],
  },
  variants: {
    name: 'title',
    empty: '（无名称）',
    columns: [
      { key: 'kind', format: label(BOOK_VARIANT_KIND_CN) },
      { key: 'isbn' },
      { key: 'price_amount' },
      { key: 'price_currency' },
      { key: 'publication_date' },
    ],
  },
}
