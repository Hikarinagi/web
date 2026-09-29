import { unzipSync } from 'fflate'

const IMAGE_FILE = /\.(jpe?g|png|webp|avif|gif|bmp)$/i
const ARCHIVE_FILE = /\.(zip|cbz)$/i

export function usePageUpload(projectId: MaybeRefOrGetter<number>) {
  const uploading = ref(false)
  const done = ref(0)
  const total = ref(0)
  const failed = ref<string[]>([])

  async function expand(files: File[]): Promise<File[]> {
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })
    const images: { path: string; file: File }[] = []
    for (const file of files) {
      if (ARCHIVE_FILE.test(file.name)) {
        const entries = unzipSync(new Uint8Array(await file.arrayBuffer()), {
          filter: entry => IMAGE_FILE.test(entry.name) && !entry.name.startsWith('__MACOSX/'),
        })
        for (const [path, data] of Object.entries(entries)) {
          const name = path.split('/').pop() || path
          images.push({ path: `${file.name}/${path}`, file: new File([data], name) })
        }
      } else if (IMAGE_FILE.test(file.name)) {
        images.push({ path: file.name, file })
      }
    }
    return images.sort((a, b) => collator.compare(a.path, b.path)).map(item => item.file)
  }

  async function upload(files: File[]): Promise<number> {
    if (uploading.value) return 0
    uploading.value = true
    failed.value = []
    done.value = 0
    try {
      const images = await expand(files)
      total.value = images.length
      for (const image of images) {
        const body = new FormData()
        body.append('file', image)
        try {
          await hikariRequest('/api/v3/manga-projects/{project_id}/pages', {
            method: 'post',
            path: { project_id: toValue(projectId) },
            body,
            toast: false,
          })
        } catch {
          failed.value.push(image.name)
        }
        done.value += 1
      }
      return images.length - failed.value.length
    } finally {
      uploading.value = false
    }
  }

  return { uploading, done, total, failed, upload }
}
