import { uploadImage } from '~/components/media-library/lib/upload'
import type { MediaValue } from '~/components/media-library/types'
import type {
  BackendEditOperation,
  BackendPropertyDefinition,
  BackendSource,
  BackendStatement,
} from './contract'

export function useImageAdd(options: {
  entry: { id: number; revision: number }
  definition: BackendPropertyDefinition
  current: BackendStatement | null
}) {
  const method = ref<'link' | 'upload'>('link')
  const url = ref('')
  const source = ref<BackendSource | null>(null)
  const reading = ref(false)
  const selected = ref<string[]>([])
  const uploads = ref<{ media: MediaValue; name: string }[]>([])
  const proofs = ref<{ media: MediaValue; name: string }[]>([])
  const uploading = ref(false)
  const saving = ref(false)
  const single = options.definition.cardinality !== 'multiple'

  async function read() {
    const input = url.value.trim()
    source.value = null
    selected.value = []
    if (!/^https?:\/\//i.test(input)) return
    reading.value = true
    try {
      source.value = await hikariRequest('/api/v3/wiki/sources', {
        method: 'POST',
        body: { input },
        toast: false,
      })
    } catch {
      source.value = null
    } finally {
      reading.value = false
    }
  }

  function toggle(image: string) {
    selected.value = selected.value.includes(image)
      ? selected.value.filter(item => item !== image)
      : single
        ? [image]
        : [...selected.value, image]
  }

  async function upload(files: File[], proof = false) {
    uploading.value = true
    try {
      for (const file of single && !proof ? files.slice(0, 1) : files) {
        const media = await uploadImage(file)
        if (!media) continue
        if (proof) proofs.value = [...proofs.value, { media, name: file.name }]
        else
          uploads.value = single
            ? [{ media, name: file.name }]
            : [...uploads.value, { media, name: file.name }]
      }
    } finally {
      uploading.value = false
    }
  }

  async function save(): Promise<boolean> {
    saving.value = true
    try {
      const page = source.value?.url ?? url.value.trim()
      const values =
        method.value === 'link'
          ? await Promise.all(
              selected.value.map(async image => ({
                media: await hikariRequest('/api/v3/wiki/sources/images', {
                  method: 'POST',
                  body: { url: page, image },
                }),
                citations: [{ method: 'EXCERPT' as const, url: page, excerpt: image }],
              })),
            )
          : uploads.value.map(item => ({
              media: item.media,
              citations: proofs.value.length
                ? [
                    {
                      method: 'SCREENSHOT' as const,
                      media: proofs.value.map(proof => proof.media.id),
                      version: null,
                      location: null,
                    },
                  ]
                : [],
            }))
      const operations: BackendEditOperation[] = values.map(item =>
        single && options.current
          ? {
              op: 'modify',
              statement: options.current.id,
              value: { media_id: item.media.id },
              citations: item.citations,
            }
          : {
              op: 'add',
              entry: options.entry.id,
              property: options.definition.property,
              value: { media_id: item.media.id },
              citations: item.citations,
            },
      )
      if (!operations.length) return false
      await hikariRequest('/api/v3/wiki/edits', {
        method: 'POST',
        body: {
          operations,
          base: [{ entry_id: options.entry.id, revision: options.entry.revision }],
        },
      })
      return true
    } catch {
      return false
    } finally {
      saving.value = false
    }
  }

  return {
    method,
    url,
    source,
    reading,
    selected,
    uploads,
    proofs,
    uploading,
    saving,
    single,
    read,
    toggle,
    upload,
    save,
  }
}
