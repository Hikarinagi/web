export function volumePrice(volume: {
  price_amount: number | null
  price_currency: string | null
  price_tax_included?: boolean | null
}) {
  if (volume.price_amount === null) return ''
  const amount =
    volume.price_currency === 'JPY'
      ? `${volume.price_amount.toLocaleString()} 日元`
      : [volume.price_currency, volume.price_amount].filter(Boolean).join(' ')
  const tax =
    volume.price_tax_included === true
      ? '（含税）'
      : volume.price_tax_included === false
        ? '（不含税）'
        : ''
  return `${amount}${tax}`
}
