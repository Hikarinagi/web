<script setup lang="ts">
  import {
    Chip,
    IconButton,
    Inline,
    Input,
    Link,
    Select,
    Stack,
    TableCell,
    TableRow,
    Tag,
    Text,
  } from '@hina-ui/vue'
  import { ChevronRight, GripVertical, Trash2, Undo2, X } from '@lucide/vue'
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'
  import { NuxtLink } from '#components'
  import { codeLabel } from '~/features/wiki/values'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'WikiWorkCastRow' })

  const props = defineProps<{
    appearance: number
    twins: number[]
    position: number
    sortable: boolean
    game: boolean
    flash: boolean
  }>()
  const emit = defineEmits<{ step: [delta: -1 | 1] }>()
  const cast = useCastEntry(() => props.appearance)
  const { can } = useCreatorPermissions()
  const deletable = computed(() => can(WIKI_PERMISSIONS.DELETE))
  const roles = computed(() =>
    (cast.field('CAST_ROLE')?.codes ?? []).map(value => ({
      value,
      label: codeLabel('CAST_ROLE', value),
    })),
  )
  const marks = computed(() => [
    {
      key: 'protagonist',
      label: '主人公',
      model: cast.protagonist,
      partial: cast.partialProtagonist,
    },
    { key: 'capturable', label: '可攻略', model: cast.capturable, partial: cast.partialCapturable },
  ])

  function key(event: KeyboardEvent) {
    if (!event.altKey || !props.sortable) return
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
    event.preventDefault()
    emit('step', event.key === 'ArrowUp' ? -1 : 1)
  }
</script>

<template>
  <TableRow
    :data-cast="appearance"
    :class="
      cn(
        'transition-colors duration-700 [&_input]:w-full',
        cast.deleted.value
          ? 'bg-danger-soft'
          : cast.dirty.value && (cast.created.value ? 'bg-success-soft' : 'bg-accent-soft'),
        flash && 'bg-accent-soft',
      )
    "
  >
    <TableCell class="py-2.5 pr-0 align-top">
      <Inline gap="none" align="center" :wrap="false">
        <IconButton
          data-drag
          label="调整顺序"
          variant="ghost"
          tone="neutral"
          size="sm"
          :disabled="!sortable"
          class="cursor-grab"
          @keydown="key"
        >
          <GripVertical />
        </IconButton>
        <Text size="xs" tone="faint" class="w-5 text-right tabular-nums">{{ position }}</Text>
      </Inline>
    </TableCell>
    <TableCell class="py-2.5 align-top">
      <Stack gap="xs">
        <Inline gap="md" align="center" :wrap="false" :inert="cast.deleted.value || undefined">
          <WikiWorkCastAvatar :image="cast.image.value" :name="cast.name.value" />
          <Input
            v-model="cast.name.value"
            placeholder="名字"
            aria-label="名字"
            lang="ja"
            class="min-w-40 flex-1"
          />
        </Inline>
        <Tag v-if="cast.deleted.value" tone="danger" class="ml-11 self-start">将删除</Tag>
        <WikiWorkCastNotes :appearance="appearance" :twins="twins" class="pl-11" />
      </Stack>
    </TableCell>
    <TableCell class="py-2.5 align-top">
      <WikiWorkCastVoices :appearance="appearance" :inert="cast.deleted.value || undefined" />
    </TableCell>
    <TableCell class="py-2.5 align-top">
      <Stack gap="xs" :inert="cast.deleted.value || undefined">
        <Select
          :model-value="cast.role.value"
          :options="roles"
          aria-label="定位"
          placeholder="定位"
          clearable
          class="w-36"
          @update:model-value="value => (cast.role.value = value ? String(value) : null)"
        />
        <Inline v-if="game" gap="sm" :wrap="false">
          <Chip
            v-for="mark in marks"
            :key="mark.key"
            selectable
            size="sm"
            :selected="mark.model.value"
            @update:selected="value => (mark.model.value = value)"
          >
            {{ mark.label }}
          </Chip>
        </Inline>
        <template v-for="mark in marks" :key="mark.key">
          <Link
            v-if="game && mark.partial.value"
            v-tooltip="mark.partial.value.versions.join('、')"
            :as="NuxtLink"
            :to="{
              path: `/entries/${appearance}/edit`,
              query: { focus: String(mark.partial.value.focus) },
            }"
            class="text-xs"
          >
            {{ mark.label }}：部分版本
          </Link>
        </template>
      </Stack>
    </TableCell>
    <TableCell class="py-2.5 align-top">
      <Inline gap="none" justify="end" align="center" :wrap="false">
        <IconButton
          v-if="cast.created.value"
          label="取消添加"
          variant="ghost"
          tone="neutral"
          size="sm"
          @click="cast.editor.uncreate(appearance)"
        >
          <X />
        </IconButton>
        <IconButton
          v-else-if="cast.deleted.value"
          label="撤销删除"
          variant="ghost"
          tone="neutral"
          size="sm"
          @click="cast.erase(false)"
        >
          <Undo2 />
        </IconButton>
        <IconButton
          v-else-if="deletable"
          label="删除出场角色"
          variant="ghost"
          tone="neutral"
          size="sm"
          @click="cast.erase(true)"
        >
          <Trash2 />
        </IconButton>
        <IconButton
          :as="NuxtLink"
          :to="`/entries/${appearance}/edit`"
          label="编辑全部资料"
          :disabled="cast.created.value"
          variant="ghost"
          tone="neutral"
          size="sm"
        >
          <ChevronRight />
        </IconButton>
      </Inline>
    </TableCell>
  </TableRow>
</template>
