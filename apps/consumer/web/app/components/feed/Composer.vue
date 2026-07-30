<script setup lang="ts">
  import type { ComposerTopic } from './composer/composables/useComposer'

  defineOptions({ name: 'FeedComposer' })

  const props = defineProps<{ topic?: ComposerTopic; sectionId?: number }>()

  const auth = useAuthStore()
  const { toLogin } = useAuthGate()

  function onCompose() {
    toLogin('login')
  }
</script>

<template>
  <section
    class="hidden overflow-hidden rounded-xl border border-surface-200 bg-surface-0 shadow-[0_1px_1.5px_rgba(15,23,42,0.05)] md:block dark:border-surface-800 dark:bg-surface-900"
  >
    <FeedComposerEditor
      v-if="auth.isAuthenticated"
      :topic="props.topic"
      :section-id="props.sectionId"
    />
    <FeedComposerTrigger v-else @compose="onCompose" />
  </section>
</template>
