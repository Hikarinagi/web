export function volumePrice(volume: {
  price_amount: number | null
  price_currency: string | null
}) {
  if (volume.price_amount === null) return ''
  return volume.price_currency === 'JPY'
    ? `${volume.price_amount.toLocaleString()} 日元`
    : [volume.price_currency, volume.price_amount].filter(Boolean).join(' ')
}
