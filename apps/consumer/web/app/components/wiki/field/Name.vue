<script setup lang="ts">
  import {
    Autocomplete,
    Avatar,
    Button,
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuSeparator,
    IconButton,
    Inline,
    Link,
    Stack,
    Text,
    type AutocompleteOption,
    type AutocompleteSelection,
    type CompletionContext,
  } from '@hina-ui/vue'
  import { Ellipsis, Link2, Search } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import { useEntryNames } from '~/features/wiki/composables/useEntryNames'
  import { useEntrySearch } from '~/features/wiki/composables/useEntrySearch'
  import { emptyValue, type ValueDraft } from '~/features/wiki/editor/draft'
  import { describeFound, sameName } from '~/features/wiki/entries'

  defineOptions({ name: 'WikiFieldName' })

  type Target = NonNullable<ValueDraft['target']>

  const props = defineProps<{ label: string; placeholder?: string }>()
  const model = defineModel<Pick<ValueDraft, 'text' | 'target'>>({ required: true })
  const editor = inject(ENTRY_EDITOR, null)
  const { typeName } = useWikiDefinitions()

  const text = computed(() => model.value.text ?? '')
  const target = computed(() => model.value.target)
  const edited = ref(false)
  const finding = ref(false)

  function find() {
    finding.value = true
  }

  const { found, loading } = useEntrySearch(() => text.value, ['PERSON', 'ORGANIZATION'])
  const FIND = 'find'
  const options = computed<AutocompleteOption[]>(() => [
    ...found.value.map(item => ({
      value: item.id,
      label: item.label,
      description: item.matched
        ? `以「${item.matched}」署名`
        : describeFound(item, typeName(item.type)),
    })),
    ...(text.value.trim() ? [{ value: FIND, label: '按其他名字查找' }] : []),
  ])
  const differs = computed(
    () => Boolean(target.value && text.value.trim()) && !sameName(text.value, target.value!.label),
  )
  const names = useEntryNames(
    () => target.value?.id ?? null,
    () => edited.value && differs.value,
  )
  const unknown = computed(
    () =>
      edited.value &&
      differs.value &&
      names.value !== null &&
      !names.value.some(name => sameName(name, text.value)),
  )

  function fill(option: AutocompleteOption, context: CompletionContext) {
    const item = found.value.find(entry => entry.id === option.value)
    return {
      range: [0, context.text.length] as [number, number],
      text: item ? (item.matched ?? item.label) : context.text,
    }
  }

  function input(value: string) {
    edited.value = true
    model.value = { ...model.value, text: value || null }
  }

  function pick(selection: AutocompleteSelection) {
    if (selection.option.value === FIND) {
      find()
      return
    }
    const item = found.value.find(entry => entry.id === selection.option.value)
    if (!item) return
    edited.value = false
    model.value = {
      text: item.matched ?? item.label,
      target: { id: item.id, type: item.type, label: item.label },
    }
  }

  function leave(event: FocusEvent) {
    const next = event.relatedTarget as Node | null
    if (next && (event.currentTarget as Node).contains(next)) return
    if (!text.value.trim() && target.value)
      model.value = { ...model.value, text: target.value.label }
  }

  async function addName(id: number, name: string) {
    if (!editor || !(await editor.borrow(id))) return
    editor.add(id, 'NAME', { ...emptyValue(), text: name })
  }

  function link(next: Target, add: boolean) {
    const credited = text.value.trim() ? text.value : next.label
    edited.value = false
    model.value = { text: credited, target: next }
    if (add) void addName(next.id, credited.trim())
  }
</script>

<template>
  <Stack gap="xs" class="min-w-0" @focusout="leave">
    <Autocomplete
      :model-value="text"
      :options="options"
      :loading="loading"
      :get-completion="fill"
      :aria-label="props.label"
      :placeholder="placeholder ?? '署名'"
      lang="ja"
      @update:model-value="input"
      @select="pick"
    >
      <template v-if="target" #leading>
        <Avatar :name="target.label.replace(/\s/g, '')" size="sm" />
      </template>
      <template #trailing>
        <DropdownMenu v-if="target" align="end">
          <IconButton :label="`${props.label}的更多操作`" variant="ghost" tone="neutral" size="xs">
            <Ellipsis />
          </IconButton>
          <template #content>
            <DropdownMenuItem @select="navigateTo(`/entries/${target.id}/edit`)">
              打开「{{ target.label }}」
            </DropdownMenuItem>
            <DropdownMenuItem @select="find">改为关联其他人</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @select="model = { ...model, target: null }">
              解除关联
            </DropdownMenuItem>
          </template>
        </DropdownMenu>
        <IconButton
          v-else-if="text.trim()"
          label="关联人物或组织"
          variant="ghost"
          tone="neutral"
          size="xs"
          @click="find"
        >
          <Link2 />
        </IconButton>
      </template>
      <template #option="{ option }">
        <Inline v-if="option.value === FIND" gap="sm" align="center" :wrap="false">
          <Search class="size-4 text-muted" />
          <Text as="span" size="sm">按其他名字查找</Text>
        </Inline>
        <Stack v-else gap="none" class="min-w-0">
          <Text as="span" size="sm" lang="ja" truncate>{{ option.label }}</Text>
          <Text as="span" size="xs" tone="muted" lang="ja" truncate>
            {{ option.description }}
          </Text>
        </Stack>
      </template>
    </Autocomplete>
    <Text v-if="differs && target" size="xs" tone="muted">
      关联到
      <Link :as="NuxtLink" :to="`/entries/${target.id}/edit`" lang="ja">{{ target.label }}</Link>
    </Text>
    <Inline v-if="unknown && target" gap="sm" align="baseline">
      <Text size="xs" tone="warning" lang="ja">
        {{ target.label }}的名字里没有「{{ text.trim() }}」
      </Text>
      <Button size="sm" variant="link" @click="addName(target.id, text.trim())">
        添加为其他名字
      </Button>
    </Inline>
    <WikiFieldNameFinder
      v-model:open="finding"
      :label="props.label"
      :credited="text.trim()"
      :current="target?.id ?? null"
      @link="link"
    />
  </Stack>
</template>
