<script setup lang="ts">
  import {
    Button,
    Indicator,
    Inline,
    Link,
    Panel,
    Skeleton,
    Spinner,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { checkItems, type CheckItem } from '~/features/workbench/manga/review/checks'
  import { useMangaReview } from '~/features/workbench/manga/review/context'

  defineProps<{ rerunning: boolean }>()
  const emit = defineEmits<{ rerun: []; navigate: [] }>()

  const TONE_LABEL = { success: '正常', warning: '提示', neutral: '说明' } as const
  const { check, state, project } = useMangaReview()
  const status = computed(() => check.value?.status ?? null)
  const items = computed(() => {
    const result = check.value?.result
    if (!result) return []
    const numbers = new Map(state.rows.value.map(row => [row.page.id, row.number]))
    return checkItems(result, id => numbers.get(id) ?? 0)
  })

  function select(item: CheckItem) {
    if (state.view.value === 'overview') {
      state.filter.value = (
        item.key === 'match' ? 'unmatched' : item.key
      ) as typeof state.filter.value
    } else if (item.pages[0] !== undefined) {
      state.openPage(item.pages[0])
    }
    emit('navigate')
  }
</script>

<template>
  <Panel title="检查" :aria-busy="status === 'PENDING'">
    <template #actions>
      <Inline v-if="status === 'PENDING'" gap="xs" align="center">
        <Spinner size="sm" />
        <Text size="sm" tone="muted">检查中</Text>
      </Inline>
      <Text v-else-if="status === 'READY'" size="sm" tone="muted">
        {{ state.counts.value.flagged ? `${state.counts.value.flagged} 页有标记` : '无标记' }}
      </Text>
    </template>
    <Stack v-if="status === 'PENDING'" gap="sm">
      <Skeleton v-for="line in 4" :key="line" class="h-10" />
    </Stack>
    <Stack v-else-if="status !== 'READY'" gap="sm" align="start">
      <Text size="sm" :tone="status === 'FAILED' ? 'danger' : 'muted'">
        {{ status === 'FAILED' ? '检查未能完成。' : '这一轮投稿尚未检查。' }}
      </Text>
      <Button
        v-if="project.status === 'REVIEW' && project.viewer_reviewer"
        size="sm"
        variant="soft"
        :loading="rerunning"
        @click="emit('rerun')"
      >
        重新检查
      </Button>
    </Stack>
    <Stack v-else as="ul" gap="none" class="divide-y divide-line">
      <Inline
        v-for="item in items"
        :key="item.key"
        as="li"
        gap="sm"
        align="start"
        :wrap="false"
        class="py-2"
      >
        <Indicator :tone="item.tone" :label="TONE_LABEL[item.tone]" size="sm" class="mt-2" />
        <Stack gap="none" class="min-w-0">
          <Text size="sm" weight="medium">{{ item.label }}</Text>
          <Link
            v-if="item.pages.length"
            as="button"
            type="button"
            class="text-left text-sm"
            @click="select(item)"
          >
            {{ item.text }}
          </Link>
          <Text v-else size="sm" tone="muted">{{ item.text }}</Text>
        </Stack>
      </Inline>
    </Stack>
  </Panel>
</template>
