<script setup lang="ts">
  import { Chip, Inline } from '@hina-ui/vue'
  import { Hash } from '@lucide/vue'

  defineOptions({ name: 'WorkTagLinks' })
  defineProps<{ tags: { id: number; name: string; to: string }[] }>()
</script>

<template>
  <Inline v-if="tags.length" gap="sm">
    <NuxtLink v-for="tag in tags" :key="tag.id" v-slot="{ href, navigate }" :to="tag.to" custom>
      <Chip as="a" :href="href" @click="navigate">
        <template #icon><Hash /></template>
        {{ tag.name }}
      </Chip>
    </NuxtLink>
  </Inline>
</template>
