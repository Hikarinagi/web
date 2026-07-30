<script setup lang="ts">
  const inlineImage =
    'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 160 100%22%3E%3Crect width=%22160%22 height=%22100%22 rx=%2212%22 fill=%22%2339c5bb%22/%3E%3Ccircle cx=%22118%22 cy=%2232%22 r=%2218%22 fill=%22%23fff%22 fill-opacity=%22.55%22/%3E%3Cpath d=%22M18 82 58 42l28 28 18-18 38 30Z%22 fill=%22%23fff%22 fill-opacity=%22.72%22/%3E%3C/svg%3E'
  const blobUrl = ref('')

  onMounted(() => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100"><rect width="160" height="100" rx="12" fill="#f59e0b"/><circle cx="50" cy="44" r="20" fill="#fff" fill-opacity=".72"/><path d="M12 86 58 50l24 20 20-18 46 34Z" fill="#fff" fill-opacity=".78"/></svg>'
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    blobUrl.value = URL.createObjectURL(blob)
  })

  onBeforeUnmount(() => {
    if (blobUrl.value) URL.revokeObjectURL(blobUrl.value)
  })
</script>

<template>
  <section class="space-y-4">
    <h2 class="text-base font-semibold text-color">Sources</h2>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <figure class="space-y-2">
        <HikariImage
          src="/favicon.ico"
          alt="Local favicon"
          class="aspect-square w-full rounded-lg border border-surface-200 dark:border-surface-800"
          image-class="object-contain p-8"
          :lazy="false"
          :skeleton="false"
          :preload="{ fetchPriority: 'high' }"
        />
        <figcaption class="text-xs text-muted-color">local eager preload</figcaption>
      </figure>

      <figure class="space-y-2">
        <HikariImage
          :src="inlineImage"
          alt="Inline data image"
          class="aspect-16/10 w-full rounded-lg"
          image-class="object-cover"
        />
        <figcaption class="text-xs text-muted-color">data:image</figcaption>
      </figure>

      <figure class="space-y-2">
        <HikariImage
          :src="blobUrl"
          fallback-src="/favicon.ico"
          alt="Blob image"
          class="aspect-16/10 w-full rounded-lg"
          image-class="object-cover"
        />
        <figcaption class="text-xs text-muted-color">blob url</figcaption>
      </figure>

      <figure class="space-y-2">
        <HikariImage
          src="galgame/10064/i9ysi2i6_20.jpg"
          fallback-src="/favicon.ico"
          alt="Object key image"
          class="aspect-16/10 w-full rounded-lg border border-surface-200 dark:border-surface-800"
          image-class="object-cover"
          preview
        />
        <figcaption class="text-xs text-muted-color">object key + CDN host</figcaption>
      </figure>
    </div>
  </section>
</template>
