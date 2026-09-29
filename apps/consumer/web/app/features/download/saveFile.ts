export function saveFile(data: ArrayBuffer, fileName: string, mime: string) {
  const link = document.createElement('a')
  const href = URL.createObjectURL(new Blob([data], { type: mime }))
  try {
    link.href = href
    link.download = fileName
    document.body.appendChild(link)
    link.click()
  } finally {
    link.remove()
    setTimeout(() => URL.revokeObjectURL(href), 0)
  }
}
