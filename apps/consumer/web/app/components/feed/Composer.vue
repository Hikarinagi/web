<script setup lang="ts">
  import { Card } from '@hina-ui/vue'
  import type { ComposerTopic } from './composer/composables/useComposer'

  defineOptions({ name: 'FeedComposer' })

  const props = defineProps<{ topic?: ComposerTopic; sectionId?: number }>()

  const auth = useAuthStore()
  const { requireLogin } = useAuthGate()
</script>

<template>
  <Card as="section" :padded="false" class="hidden rounded-xl md:block">
    <FeedComposerEditor
      v-if="auth.isAuthenticated"
      :topic="props.topic"
      :section-id="props.sectionId"
    />
    <FeedComposerTrigger v-else @compose="requireLogin" />
  </Card>
</template>
