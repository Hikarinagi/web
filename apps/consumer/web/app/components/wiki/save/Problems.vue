<script setup lang="ts">
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { Alert, Button, Inline, Stack, Text } from '@hina-ui/vue'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import { partOf } from '~/features/wiki/editor/parts'
  import type { Problem } from '~/features/wiki/editor/problems'

  defineOptions({ name: 'WikiSaveProblems' })

  type Check = ApiData<'/api/v3/wiki/edits/checks', 'post'>

  const props = defineProps<{ problems: Problem[]; check: Check | null }>()
  const editor = inject(ENTRY_EDITOR)!

  const VIOLATIONS: Record<string, string> = {
    required: '必填项为空',
    single: '这一项只能有一个值',
    period_overlap: '期间与另一个值重叠',
    duplicate: '这个编号已被另一个条目使用',
    incomplete: '还没有填写完整',
    relation_pair: '两部作品之间已有一种关系',
    version_scope: '适用版本不属于本作',
  }
  const typeOf = (id: number) => editor.members.value.find(item => item.id === id)?.type
  const all = computed<Problem[]>(() => [
    ...props.problems,
    ...(props.check?.violations ?? []).map(item => ({
      entry: item.entry_id,
      property: item.property,
      id: null,
      message: VIOLATIONS[item.reason] ?? '这一项不符合规则',
    })),
    ...(props.check?.locked ?? []).map(entry => ({
      entry,
      property: null,
      id: null,
      message: '条目已锁定，只有管理员能修改',
    })),
  ])
  const where = (problem: Problem) => {
    const type = typeOf(problem.entry)
    const label = problem.property
      ? editor.definitions.value
          .get(type ?? 'GAME')
          ?.properties.find(item => item.property === problem.property)?.label
      : null
    return label ?? '依据'
  }

  function go(problem: Problem) {
    const root = [...editor.entries.value.values()][0]
    const type = typeOf(problem.entry)
    if (!root || !type || !problem.property) return
    const part = partOf(root.type, type, problem.property)
    const volume = editor.property(problem.entry, 'INCLUDED_VOLUME').values[0]?.value.target?.id
    const selection =
      type === 'PRODUCT' && part === 'releases'
        ? `/${problem.entry}`
        : type === 'VOLUME'
          ? `/${problem.entry}`
          : type === 'BOOK' && volume
            ? `/${volume}/${problem.entry}`
            : ''
    const path = root.type === 'GAME' || root.type === 'SERIES' ? `/${part}${selection}` : ''
    void navigateTo({
      path: `/entries/${root.id}/edit${path}`,
      query: problem.id === null ? {} : { focus: String(problem.id) },
    })
  }
</script>

<template>
  <Alert :open="all.length > 0" tone="danger" title="以下问题需要先处理">
    <Stack gap="xs">
      <Inline v-for="(problem, index) in all" :key="index" gap="sm" align="center" :wrap="false">
        <Text as="span" size="sm" class="min-w-0 flex-1">
          {{ where(problem) }}：{{ problem.message }}
        </Text>
        <Button
          v-if="problem.property"
          variant="link"
          size="sm"
          class="shrink-0"
          @click="go(problem)"
        >
          前往修改
        </Button>
      </Inline>
    </Stack>
  </Alert>
</template>
