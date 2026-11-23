<script setup lang="ts">
  import { Button, IconButton, Inline, MultiSelect, Stack, Text } from '@hina-ui/vue'
  import { X } from '@lucide/vue'
  import type { ValueDraft } from '~/features/wiki/editor/draft'

  defineOptions({ name: 'WikiWorkCastVoices' })

  const props = defineProps<{ appearance: number }>()
  const cast = useCastEntry(() => props.appearance)
  const versions = computed(() => cast.editor.versions.value)
  const options = computed(() =>
    versions.value.map(item => ({ value: item.id, label: item.label })),
  )
  const original = computed(() => cast.voices.value.filter(voice => !voice.value.versions.length))
  const others = computed(() => cast.voices.value.filter(voice => voice.value.versions.length))
  const adding = ref(false)
  const picked = ref<number[]>([])
  const blank = { text: null, target: null }

  const chosen = (ids: (string | number)[]) =>
    versions.value.filter(item => ids.map(Number).includes(item.id))

  function add(next: Pick<ValueDraft, 'text' | 'target'>) {
    cast.setVoice(null, next, chosen(picked.value))
    adding.value = false
    picked.value = []
  }
</script>

<template>
  <Stack gap="xs">
    <Inline v-for="voice in original" :key="voice.id" gap="xs" align="center" :wrap="false">
      <WikiFieldName
        :model-value="{ text: voice.value.text, target: voice.value.target }"
        label="配音"
        placeholder="配音演员"
        class="min-w-0 flex-1"
        @update:model-value="next => cast.setVoice(voice, next)"
      />
      <IconButton
        v-if="original.length > 1"
        label="删除这条配音"
        variant="ghost"
        tone="neutral"
        size="sm"
        @click="cast.removeVoice(voice)"
      >
        <X />
      </IconButton>
    </Inline>
    <WikiFieldName
      v-if="!original.length"
      :model-value="blank"
      label="配音"
      placeholder="配音演员"
      @update:model-value="next => cast.setVoice(null, next)"
    />
    <Stack v-for="voice in others" :key="voice.id" gap="xs">
      <Inline gap="xs" align="center" :wrap="false">
        <MultiSelect
          :model-value="voice.value.versions.map(item => item.id)"
          :options="options"
          aria-label="所属版本"
          placeholder="选择版本"
          size="sm"
          class="min-w-0 flex-1"
          @update:model-value="ids => cast.setVersions(voice, chosen(ids))"
        />
        <IconButton
          label="删除这条配音"
          variant="ghost"
          tone="neutral"
          size="sm"
          @click="cast.removeVoice(voice)"
        >
          <X />
        </IconButton>
      </Inline>
      <WikiFieldName
        :model-value="{ text: voice.value.text, target: voice.value.target }"
        label="配音"
        placeholder="配音演员"
        @update:model-value="next => cast.setVoice(voice, next)"
      />
    </Stack>
    <Stack v-if="adding" gap="xs">
      <MultiSelect
        v-model="picked"
        :options="options"
        aria-label="所属版本"
        placeholder="先选择版本"
        size="sm"
      />
      <WikiFieldName
        v-if="picked.length"
        :model-value="blank"
        label="配音"
        placeholder="这些版本的配音演员"
        @update:model-value="add"
      />
    </Stack>
    <Button
      v-else-if="options.length"
      variant="link"
      size="sm"
      class="self-start"
      @click="adding = true"
    >
      其他版本另有配音
    </Button>
    <Text v-if="!options.length && others.length" size="xs" tone="muted">
      本作还没有记录发行版本
    </Text>
    <WikiFieldBefore
      v-if="cast.touched('CREDIT') && cast.field('CREDIT')"
      :view="cast.view('CREDIT')"
      :definition="cast.field('CREDIT')!"
    />
  </Stack>
</template>
