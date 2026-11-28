<script setup lang="ts">
  import { Button, Empty } from '@hina-ui/vue'
  import type { NuxtError } from '#app'
  import { pageErrorMessage } from '~/utils/api/error'

  defineOptions({ name: 'CreatorPageError' })

  const props = defineProps<{ error: NuxtError | Error }>()
  const emit = defineEmits<{ retry: [] }>()
  const { t } = useLocaleText()

  const missing = computed(() => (props.error as NuxtError).status === 404)
  const message = computed(() => pageErrorMessage(props.error) || props.error.message.trim())
</script>

<template>
  <Empty
    size="lg"
    :title="missing ? t('error.page.missing') : t('error.page.loadFailed')"
    :description="message"
    class="py-24"
  >
    <template v-if="!missing" #actions>
      <Button size="sm" variant="outline" tone="neutral" @click="emit('retry')">
        {{ t('common.retry') }}
      </Button>
    </template>
  </Empty>
</template>
