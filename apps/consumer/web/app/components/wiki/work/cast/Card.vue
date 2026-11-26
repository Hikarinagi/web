<script setup lang="ts">
  import {
    Card,
    Chip,
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuSeparator,
    IconButton,
    Inline,
    Input,
    Select,
    Stack,
    Tag,
  } from '@hina-ui/vue'
  import { Ellipsis, Undo2, X } from '@lucide/vue'
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'
  import { codeLabel } from '~/features/wiki/values'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'WikiWorkCastCard' })

  const props = defineProps<{
    appearance: number
    game: boolean
    first: boolean
    last: boolean
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
</script>

<template>
  <Card
    :data-cast="appearance"
    :class="
      cn(
        'p-3 transition-colors duration-700',
        cast.deleted.value
          ? 'bg-danger-soft'
          : cast.dirty.value && (cast.created.value ? 'bg-success-soft' : 'bg-accent-soft'),
        flash && 'bg-accent-soft',
      )
    "
  >
    <Inline gap="sm" align="start" :wrap="false">
      <WikiWorkCastAvatar :image="cast.image.value" :name="cast.name.value" class="mt-1" />
      <Stack gap="sm" class="min-w-0 flex-1">
        <Tag v-if="cast.deleted.value" tone="danger" class="self-start">将删除</Tag>
        <Stack gap="sm" :inert="cast.deleted.value || undefined">
          <Stack gap="xs">
            <Input v-model="cast.name.value" placeholder="名字" aria-label="名字" lang="ja" />
            <WikiFieldBefore
              v-if="cast.touched('LABEL') && cast.field('LABEL')"
              :view="cast.view('LABEL')"
              :definition="cast.field('LABEL')!"
            />
          </Stack>
          <WikiWorkCastVoices :appearance="appearance" />
          <Inline gap="sm" align="center">
            <Select
              :model-value="cast.role.value"
              :options="roles"
              aria-label="定位"
              placeholder="定位"
              clearable
              class="w-36 shrink-0"
              @update:model-value="value => (cast.role.value = value ? String(value) : null)"
            />
            <template v-if="game">
              <Chip
                selectable
                size="sm"
                :selected="cast.protagonist.value"
                @update:selected="value => (cast.protagonist.value = value)"
              >
                主人公
              </Chip>
              <Chip
                selectable
                size="sm"
                :selected="cast.capturable.value"
                @update:selected="value => (cast.capturable.value = value)"
              >
                可攻略
              </Chip>
            </template>
          </Inline>
        </Stack>
      </Stack>
      <Stack gap="xs" class="shrink-0">
        <DropdownMenu align="end">
          <IconButton label="更多操作" variant="ghost" tone="neutral" size="sm">
            <Ellipsis />
          </IconButton>
          <template #content>
            <DropdownMenuItem :disabled="first" @select="emit('step', -1)">上移</DropdownMenuItem>
            <DropdownMenuItem :disabled="last" @select="emit('step', 1)">下移</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              :disabled="cast.created.value"
              @select="navigateTo(`/entries/${appearance}/edit`)"
            >
              编辑全部资料
            </DropdownMenuItem>
            <DropdownMenuItem
              :disabled="cast.created.value"
              @select="navigateTo(`/entries/${appearance}/merge`)"
            >
              与重复的条目合并
            </DropdownMenuItem>
            <template v-if="!cast.created.value && deletable">
              <DropdownMenuItem v-if="cast.deleted.value" @select="cast.erase(false)">
                撤销删除
              </DropdownMenuItem>
              <DropdownMenuItem v-else tone="danger" @select="cast.erase(true)">
                删除
              </DropdownMenuItem>
            </template>
          </template>
        </DropdownMenu>
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
      </Stack>
    </Inline>
  </Card>
</template>
