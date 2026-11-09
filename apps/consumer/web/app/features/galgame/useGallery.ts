import type { LightboxItem } from '@hina-ui/vue'
import { useNsfwPolicy } from '~/features/nsfw/composables/useNsfwPolicy'
import { useNsfwReveal } from '~/features/nsfw/composables/useNsfwReveal'
import type { HikariImageMediaSource } from '~/utils/media/image'
import { imageSourceNsfw, resolveImageUrl } from '~/utils/media/image'

type Picture = HikariImageMediaSource & { id: number; src: string }

export function useGallery(
  source: () => { images: Picture[]; cover: Picture | null; title: string },
) {
  const config = useRuntimeConfig()
  const { shouldBlockNsfw, shouldBlurNsfw } = useNsfwPolicy()
  const { revealed } = useNsfwReveal()
  const loaded = ref(false)
  const open = ref(false)
  const at = ref(0)

  function viewable(image: Picture | null) {
    if (!image) return false
    const nsfw = imageSourceNsfw(image)
    return !shouldBlockNsfw(nsfw) && !(shouldBlurNsfw(nsfw) && !revealed.value.includes(image.src))
  }

  const pictures = computed(() => {
    const { images, cover, title } = source()
    return [
      ...images.map(image => ({ id: String(image.id), image, alt: title })),
      ...(cover ? [{ id: 'cover', image: cover, alt: `${title} 封面` }] : []),
    ]
  })
  const items = computed<LightboxItem[]>(() =>
    pictures.value
      .filter(picture => viewable(picture.image))
      .map(picture => ({
        id: picture.id,
        alt: picture.alt,
        src: resolveImageUrl(picture.image.src, {
          cdnHost: config.public.cdnHost,
          imageProcessorHost: config.public.imageProcessorHost,
          processing: false,
        }),
      })),
  )

  function show(index: number) {
    if (!items.value.length) return
    const id = pictures.value[index]?.id
    at.value = Math.max(
      0,
      items.value.findIndex(item => item.id === id),
    )
    loaded.value = true
    open.value = true
  }

  return { loaded, open, at, items, viewable, show }
}
