<script setup lang="ts">
  import { Button, Empty } from '@hina-ui/vue'
  import type { NuxtError } from '#app'

  defineOptions({ name: 'CreatorPageError' })

  const props = defineProps<{ error: NuxtError | Error }>()
  const emit = defineEmits<{ retry: [] }>()

  const missing = computed(() => (props.error as NuxtError).status === 404)
  const message = computed(() => props.error.message.trim())
</script>

<template>
  <Empty
    size="lg"
    :title="missing ? '没有找到这个页面' : '加载失败'"
    :description="message"
    class="py-24"
  >
    <template v-if="!missing" #actions>
      <Button size="sm" variant="outline" tone="neutral" @click="emit('retry')">重试</Button>
    </template>
  </Empty>
</template>
