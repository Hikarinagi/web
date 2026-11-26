<script setup lang="ts">
  import { Button, IconButton, Inline, MultiSelect, Stack } from '@hina-ui/vue'
  import { Plus, X } from '@lucide/vue'
  import type { ComponentPublicInstance } from 'vue'

  defineOptions({ name: 'WikiWorkCastVoices' })

  const props = defineProps<{ appearance: number }>()
  const cast = useCastEntry(() => props.appearance)
  const versions = computed(() => cast.editor.versions.value)
  const options = computed(() =>
    versions.value.map(item => ({ value: item.id, label: item.label })),
  )
  const list = useTemplateRef<ComponentPublicInstance>('list')
  const altered = computed(() =>
    cast.view('CREDIT').values.some(item => item.state !== 'same' && item.state !== 'added'),
  )

  const chosen = (ids: (string | number)[]) => versions.value.filter(item => ids.includes(item.id))

  async function add() {
    cast.setVoice(null, { text: null, target: null })
    await nextTick()
    const rows = (list.value?.$el as HTMLElement | undefined)?.querySelectorAll('[data-voice]')
    rows?.[rows.length - 1]?.querySelector('input')?.focus()
  }
</script>

<template>
  <Stack ref="list" gap="xs" class="md:min-w-80">
    <Inline
      v-for="voice in cast.voices.value"
      :key="voice.id"
      data-voice
      gap="xs"
      align="start"
      :wrap="false"
    >
      <WikiFieldName
        :model-value="{ text: voice.value.text, target: voice.value.target }"
        label="配音"
        placeholder="配音演员"
        class="min-w-0 flex-1"
        @update:model-value="next => cast.setVoice(voice, next)"
      />
      <MultiSelect
        v-if="options.length"
        :model-value="voice.value.versions.map(item => item.id)"
        :options="options"
        :max-visible="1"
        placeholder="原版"
        aria-label="适用版本"
        class="w-24 shrink-0"
        @update:model-value="ids => cast.setVersions(voice, chosen(ids))"
      />
      <IconButton
        label="删除配音"
        variant="ghost"
        tone="neutral"
        class="shrink-0"
        @click="cast.removeVoice(voice)"
      >
        <X />
      </IconButton>
    </Inline>
    <Button variant="ghost" size="sm" class="self-start" @click="add">
      <template #icon><Plus /></template>
      添加配音
    </Button>
    <WikiFieldBefore
      v-if="altered && cast.field('CREDIT')"
      :view="cast.view('CREDIT')"
      :definition="cast.field('CREDIT')!"
    />
  </Stack>
</template>
