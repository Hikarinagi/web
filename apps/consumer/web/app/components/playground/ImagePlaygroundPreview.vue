<script setup lang="ts">
  const singleSrc = 'galgame/10064/i9ysi2i6_20.jpg'
  const gallery = [
    { src: 'galgame/10064/i9ysi2i6_20.jpg', alt: '画廊图 1' },
    { src: 'galgame/10552/v67o63mn_2.jpg', alt: '画廊图 2' },
    { src: 'https://lain.bgm.tv/pic/cover/l/d9/c4/212271_L38VV.jpg', alt: '画廊图 3' },
  ]
  const thumbProcessing = {
    width: 480,
    quality: 82,
    fit: 'cover',
    format: 'auto',
  } as const
</script>

<template>
  <section class="space-y-4">
    <header class="space-y-1">
      <h2 class="text-base font-semibold text-color">Preview</h2>
      <p class="text-xs text-muted-color">
        点击图片打开预览。多图场景用 HikariImageGroup 包裹，支持左右切换。
      </p>
    </header>

    <div class="space-y-6">
      <figure class="space-y-2">
        <HikariImage
          :src="singleSrc"
          alt="单图预览"
          class="aspect-video w-full max-w-md rounded-lg"
          image-class="object-cover"
          :processing="thumbProcessing"
          preview
        />
        <figcaption class="text-xs text-muted-color">单图预览 · preview</figcaption>
      </figure>

      <figure class="space-y-2">
        <HikariImageGroup class="grid grid-cols-3 gap-3">
          <HikariImage
            v-for="item in gallery"
            :key="item.src"
            :src="item.src"
            :alt="item.alt"
            class="aspect-square w-full rounded-lg"
            image-class="object-cover"
            :processing="thumbProcessing"
            preview
          />
        </HikariImageGroup>
        <figcaption class="text-xs text-muted-color">
          多图预览 · HikariImageGroup · ← → 切换
        </figcaption>
      </figure>
    </div>
  </section>
</template>
