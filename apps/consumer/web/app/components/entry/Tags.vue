<script setup lang="ts">
  import { Button as HnButton, Chip, Inline, Stack, Text } from '@hina-ui/vue'

  defineOptions({ name: 'EntryTags' })
  const props = defineProps<{ tags: { id: number; name: string; to: string }[] }>()

  const COLLAPSED = 12
  const all = ref(false)
  const shown = computed(() => (all.value ? props.tags : props.tags.slice(0, COLLAPSED)))
</script>

<template>
  <Stack v-if="tags.length" gap="sm">
    <Text size="sm" tone="muted">标签</Text>
    <Inline gap="xs">
      <NuxtLink v-for="tag in shown" :key="tag.id" v-slot="{ href, navigate }" :to="tag.to" custom>
        <Chip as="a" :href="href" size="sm" variant="soft" @click="navigate">{{ tag.name }}</Chip>
      </NuxtLink>
      <HnButton
        v-if="tags.length > COLLAPSED"
        variant="ghost"
        tone="neutral"
        size="sm"
        @click="all = !all"
      >
        {{ all ? '收起' : `全部 ${tags.length}` }}
      </HnButton>
    </Inline>
  </Stack>
</template>
