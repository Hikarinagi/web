import { unzipSync } from 'fflate'
import { epubImageEntries } from '~/features/workbench/manga/epub-pages'
import { isApiError } from '~/utils/api/error'

const IMAGE_FILE = /\.(jpe?g|png|webp|avif|gif|bmp)$/i
const ARCHIVE_FILE = /\.(zip|cbz|epub)$/i
const FATAL_STATUS = new Set([403, 404, 409])

export function usePageUpload(projectId: MaybeRefOrGetter<number>) {
  const uploading = ref(false)
  const done = ref(0)
  const total = ref(0)
  const failed = ref<string[]>([])
  const stopped = ref<string | null>(null)

  async function expand(files: File[]): Promise<File[]> {
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })
    const images: { path: string; file: File }[] = []
    for (const file of files) {
      if (ARCHIVE_FILE.test(file.name)) {
        const entries = unzipSync(new Uint8Array(await file.arrayBuffer()), {
          filter: entry => !entry.name.startsWith('__MACOSX/'),
        })
        const ordered = /\.epub$/i.test(file.name) ? epubImageEntries(entries) : null
        const paths = ordered ?? Object.keys(entries).filter(path => IMAGE_FILE.test(path))
        paths.forEach((path, index) => {
          const name = path.split('/').pop() || path
          const key = ordered ? String(index + 1).padStart(6, '0') : path
          images.push({ path: `${file.name}/${key}`, file: new File([entries[path]!], name) })
        })
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
    stopped.value = null
    done.value = 0
    try {
      const images = await expand(files)
      total.value = images.length
      for (const [index, image] of images.entries()) {
        const body = new FormData()
        body.append('file', image)
        try {
          await hikariRequest('/api/v3/manga-projects/{project_id}/pages', {
            method: 'post',
            path: { project_id: toValue(projectId) },
            body,
            toast: false,
          })
        } catch (error) {
          failed.value.push(image.name)
          if (isApiError(error) && FATAL_STATUS.has(error.status)) {
            failed.value.push(...images.slice(index + 1).map(rest => rest.name))
            stopped.value = error.message
            break
          }
        }
        done.value += 1
      }
      return images.length - failed.value.length
    } finally {
      uploading.value = false
    }
  }

  return { uploading, done, total, failed, stopped, upload }
}
