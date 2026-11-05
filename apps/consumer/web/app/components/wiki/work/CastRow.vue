<script setup lang="ts">
  import { AspectRatio, Button, Inline, Link, Stack, Tag } from '@hina-ui/vue'
  import { ChevronRight, Plus } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import { emptyValue } from '~/features/wiki/editor/draft'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'WikiWorkCastRow' })

  const props = defineProps<{ appearance: number; twin: number | null }>()
  const editor = inject(ENTRY_EDITOR)!
  const definition = computed(() => editor.definitions.value.get('APPEARANCE'))
  const field = (property: 'LABEL' | 'CREDIT') =>
    definition.value?.properties.find(item => item.property === property)
  const view = (property: 'LABEL' | 'CREDIT' | 'IMAGE') =>
    editor.property(props.appearance, property).values
  const image = computed(
    () => view('IMAGE').find(item => item.state !== 'removed')?.value.media ?? null,
  )
  const created = computed(() => props.appearance < 0)
</script>

<template>
  <Inline
    gap="md"
    align="start"
    :wrap="false"
    :class="cn('px-(--hn-panel-p) py-3 max-md:flex-wrap', created && 'bg-success-soft')"
  >
    <AspectRatio :ratio="1" class="w-12 shrink-0 overflow-hidden rounded-sm bg-inset">
      <HikariImage
        v-if="image"
        :src="image"
        alt=""
        preset="small"
        class="size-full"
        image-class="size-full object-cover"
      />
    </AspectRatio>
    <Stack gap="xs" class="w-60 shrink-0 max-md:w-full max-md:shrink">
      <WikiFieldValue
        v-for="item in view('LABEL')"
        :key="item.id"
        :item="item"
        :entry="appearance"
        :definition="field('LABEL')!"
        label="名字"
        :up="false"
        :down="false"
      />
      <Inline v-if="twin !== null" gap="sm" align="center">
        <Tag size="sm" tone="warning">同名</Tag>
        <Link
          v-if="appearance > 0 && twin > 0"
          :as="NuxtLink"
          :to="`/entries/${appearance}/merge/${twin}`"
          class="text-sm"
        >
          合并
        </Link>
      </Inline>
    </Stack>
    <Stack gap="xs" class="min-w-0 flex-1">
      <WikiFieldValue
        v-for="item in view('CREDIT')"
        :key="item.id"
        :item="item"
        :entry="appearance"
        :definition="field('CREDIT')!"
        label="配音"
        :up="false"
        :down="false"
      />
      <Button
        v-if="!view('CREDIT').length"
        variant="ghost"
        tone="neutral"
        size="sm"
        class="self-start"
        @click="editor.add(appearance, 'CREDIT', { ...emptyValue(), code: 'VOICE' })"
      >
        <template #icon><Plus /></template>
        添加配音
      </Button>
    </Stack>
    <IconButton
      :as="NuxtLink"
      :to="`/entries/${appearance}/edit`"
      label="打开出场角色"
      :disabled="created"
      variant="ghost"
      tone="neutral"
      size="sm"
      class="shrink-0"
    >
      <ChevronRight />
    </IconButton>
  </Inline>
</template>
