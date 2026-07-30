<script setup lang="ts">
  import { resolveImageUrl } from '~/utils/media/image'

  const config = useRuntimeConfig()
  const objectKey = 'galgame/10064/i9ysi2i6_20.jpg'
  const projectMediaSrc = 'https://images.yurari.moe/galgame/10552/v67o63mn_2.jpg'
  const thirdPartySrc = 'https://lain.bgm.tv/pic/cover/l/d9/c4/212271_L38VV.jpg'

  const resolvedUrls = computed(() => ({
    directKey: resolveImageUrl(objectKey, {
      cdnHost: config.public.cdnHost,
      imageProcessorHost: config.public.imageProcessorHost,
      processing: false,
    }),
    presetKey: resolveImageUrl(objectKey, {
      cdnHost: config.public.cdnHost,
      imageProcessorHost: config.public.imageProcessorHost,
      preset: 'small',
    }),
    projectMedia: resolveImageUrl(projectMediaSrc, {
      cdnHost: config.public.cdnHost,
      imageProcessorHost: config.public.imageProcessorHost,
      processing: { width: 640, height: 360, quality: 82, fit: 'cover', gravity: 'auto' },
    }),
    thirdParty: resolveImageUrl(thirdPartySrc, {
      imageProcessorHost: config.public.imageProcessorHost,
      processing: { width: 320, quality: 82, fit: 'scale-down', format: 'auto' },
    }),
  }))
</script>

<template>
  <section class="space-y-4">
    <h2 class="text-base font-semibold text-color">Processing</h2>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <figure class="space-y-2">
        <HikariImage
          :src="objectKey"
          alt="Direct object key image"
          class="aspect-3/4 w-full rounded-lg"
          image-class="object-cover"
          :processing="false"
          preview
        />
        <figcaption class="text-xs break-all text-muted-color">
          processing=false · {{ resolvedUrls.directKey }}
        </figcaption>
      </figure>

      <figure class="space-y-2">
        <HikariImage
          :src="objectKey"
          alt="Preset processed object key image"
          class="aspect-3/4 w-full rounded-lg"
          image-class="object-cover"
          preset="small"
          preview
        />
        <figcaption class="text-xs break-all text-muted-color">
          preset=small · {{ resolvedUrls.presetKey }}
        </figcaption>
      </figure>

      <figure class="space-y-2">
        <HikariImage
          :src="projectMediaSrc"
          alt="Project media processed banner"
          class="aspect-video w-full rounded-lg"
          image-class="object-cover"
          :processing="{ width: 640, height: 360, quality: 82, fit: 'cover', gravity: 'auto' }"
          preview
        />
        <figcaption class="text-xs break-all text-muted-color">
          project media URL + processing · {{ resolvedUrls.projectMedia }}
        </figcaption>
      </figure>

      <figure class="space-y-2">
        <HikariImage
          :src="thirdPartySrc"
          fallback-src="/favicon.ico"
          alt="Third party provider processed image"
          class="aspect-3/4 w-full rounded-lg border border-surface-200 dark:border-surface-800"
          image-class="object-cover"
          :processing="{ width: 320, quality: 82, fit: 'scale-down', format: 'auto' }"
          preview
        />
        <figcaption class="text-xs break-all text-muted-color">
          third-party provider · {{ resolvedUrls.thirdParty }}
        </figcaption>
      </figure>
    </div>
  </section>
</template>
