<script setup lang="ts">
  import { Button, IconButton, Inline, Stack, Text } from '@hina-ui/vue'
  import { X } from '@lucide/vue'
  import type { ValueDraft } from '~/features/wiki/editor/draft'

  defineOptions({ name: 'WikiWorkCastVoices' })

  const props = defineProps<{ appearance: number }>()
  const cast = useCastEntry(() => props.appearance)
  const versions = computed(() => cast.editor.versions.value)
  const original = computed(() => cast.voices.value.filter(voice => !voice.value.versions.length))
  const others = computed(() => cast.voices.value.filter(voice => voice.value.versions.length))
  const adding = ref(false)
  const picked = ref<number[]>([])
  const blank = { text: null, target: null }

  const chosen = (ids: number[]) => versions.value.filter(item => ids.includes(item.id))

  function add(next: Pick<ValueDraft, 'text' | 'target'>) {
    cast.setVoice(null, next, chosen(picked.value))
    adding.value = false
    picked.value = []
  }
</script>

<template>
  <Stack gap="md">
    <Stack v-for="voice in original" :key="voice.id" gap="xs">
      <Text size="xs" tone="muted">原版</Text>
      <Inline gap="xs" align="start" :wrap="false">
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
    </Stack>
    <Stack v-if="!original.length" gap="xs">
      <Text size="xs" tone="muted">原版</Text>
      <WikiFieldName
        :model-value="blank"
        label="配音"
        placeholder="配音演员"
        @update:model-value="next => cast.setVoice(null, next)"
      />
    </Stack>
    <Stack v-for="voice in others" :key="voice.id" gap="xs">
      <WikiWorkCastVersions
        :model-value="voice.value.versions.map(item => item.id)"
        :versions="versions"
        @update:model-value="ids => cast.setVersions(voice, chosen(ids))"
      />
      <Inline gap="xs" align="start" :wrap="false">
        <WikiFieldName
          :model-value="{ text: voice.value.text, target: voice.value.target }"
          label="配音"
          placeholder="配音演员"
          class="min-w-0 flex-1"
          @update:model-value="next => cast.setVoice(voice, next)"
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
    </Stack>
    <Stack v-if="adding" gap="xs">
      <WikiWorkCastVersions v-model="picked" :versions="versions" />
      <WikiFieldName
        v-if="picked.length"
        :model-value="blank"
        label="配音"
        placeholder="配音演员"
        @update:model-value="add"
      />
    </Stack>
    <Button
      v-else-if="versions.length"
      variant="link"
      size="sm"
      class="self-start"
      @click="adding = true"
    >
      添加其他版本的配音
    </Button>
    <WikiFieldBefore
      v-if="cast.touched('CREDIT') && cast.field('CREDIT')"
      :view="cast.view('CREDIT')"
      :definition="cast.field('CREDIT')!"
    />
  </Stack>
</template>
