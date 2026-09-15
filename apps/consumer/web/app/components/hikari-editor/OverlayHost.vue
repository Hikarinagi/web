<script setup lang="ts">
  import { Dialog, Popover, Sheet } from '@hina-ui/vue'
  import type { EditorPlugin } from './plugins/types'
  import { useOverlayHost } from './composables/useOverlayHost'

  const props = defineProps<{ plugins: EditorPlugin[] }>()
  const {
    open,
    anchor,
    title,
    presentation,
    scroll,
    narrow,
    renderedComp,
    renderedProps,
    overlayKey,
    command,
    commandOpen,
    commandHighlighted,
    commandCommit,
    mention,
    mentionOpen,
    mentionHighlighted,
    mentionCommit,
  } = useOverlayHost(() => props.plugins)

  const asSheet = computed({
    get: () => open.value && narrow.value,
    set: value => (open.value = value),
  })
  const asDialog = computed({
    get: () => open.value && !narrow.value && presentation.value === 'dialog',
    set: value => (open.value = value),
  })
  const asPopover = computed({
    get: () => open.value && !narrow.value && presentation.value === 'anchored',
    set: value => (open.value = value),
  })
</script>

<template>
  <Dialog v-model:open="asDialog" :title="title" size="lg">
    <template #content>
      <component :is="renderedComp" v-if="renderedComp" :key="overlayKey" v-bind="renderedProps" />
    </template>
  </Dialog>

  <Popover
    v-model:open="asPopover"
    :anchor="anchor"
    :modal="false"
    side="bottom"
    align="start"
    :padded="false"
    class="max-w-none p-3"
  >
    <template #content>
      <component :is="renderedComp" v-if="renderedComp" :key="overlayKey" v-bind="renderedProps" />
    </template>
  </Popover>

  <Popover
    v-model:open="commandOpen"
    :anchor="command?.anchor ?? null"
    :modal="false"
    side="bottom"
    align="start"
    :side-offset="4"
    update-position-strategy="always"
    :padded="false"
    class="max-w-none"
    @open-auto-focus="event => event.preventDefault()"
    @interact-outside="event => event.preventDefault()"
  >
    <template #content>
      <HikariEditorPluginsCommandMenu
        v-if="command"
        :items="command.items"
        :query="command.query"
        :highlighted="commandHighlighted"
        @select="commandCommit"
        @highlight="index => (commandHighlighted = index)"
      />
    </template>
  </Popover>

  <Popover
    v-model:open="mentionOpen"
    :anchor="mention?.anchor ?? null"
    :modal="false"
    side="bottom"
    align="start"
    :side-offset="4"
    update-position-strategy="always"
    :padded="false"
    class="max-w-none"
    @open-auto-focus="event => event.preventDefault()"
    @interact-outside="event => event.preventDefault()"
  >
    <template #content>
      <HikariEditorPluginsMentionSuggestionList
        v-if="mention"
        :items="mention.items"
        :loading="mention.loading"
        :resolved="mention.resolved"
        :query="mention.query"
        :highlighted="mentionHighlighted"
        @select="mentionCommit"
        @highlight="index => (mentionHighlighted = index)"
      />
    </template>
  </Popover>

  <Sheet v-model:open="asSheet" :title="title" class="h-[60dvh]">
    <template v-if="scroll === 'self'" #body>
      <component :is="renderedComp" v-if="renderedComp" :key="overlayKey" v-bind="renderedProps" />
    </template>
    <template v-else #content>
      <component :is="renderedComp" v-if="renderedComp" :key="overlayKey" v-bind="renderedProps" />
    </template>
  </Sheet>
</template>
