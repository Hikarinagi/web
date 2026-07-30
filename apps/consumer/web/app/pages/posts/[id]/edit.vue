<script setup lang="ts">
  defineOptions({ name: 'PagePostEdit' })
  definePageMeta({ middleware: 'auth' })

  const route = useRoute()
  const id = Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)
</script>

<template>
  <FeedComposerFullPage :edit-id="id" />
</template>
