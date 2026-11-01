<script setup lang="ts">
  import { Button, Checkbox, Inline, Panel, Stack, Text } from '@hina-ui/vue'
  import { CopyCheck, Pencil } from '@lucide/vue'
  import type { DuplicateCheck } from '~/features/creator/composables/useDuplicateCheck'
  import { notSameText, type BackendDuplicateCandidate } from '~/features/creator/duplicates'
  import { RESOURCE_SLUG } from '~/features/creator/labels'

  const props = defineProps<{ check: DuplicateCheck; resourceType: string }>()

  const { confirm } = useHikariConfirm()

  const authorName = computed(() => {
    const work = props.check.authorWorks.value[0]
    return work?.reasons.find(reason => reason.kind === 'author')?.name || work?.author || ''
  })

  function isDismissed(item: BackendDuplicateCandidate) {
    return props.check.dismissed.value.includes(item.id)
  }

  function editInstead(item: BackendDuplicateCandidate) {
    confirm({
      title: '编辑现有条目',
      description: `本页上的草稿将被丢弃，#${item.id} ${item.title} 将在编辑器中打开。`,
      confirmText: '丢弃并编辑',
      cancelText: '取消',
      onConfirm: () => navigateTo(`/create/edit/${RESOURCE_SLUG[item.resource_type]}/${item.id}`),
    })
  }
</script>

<template>
  <Panel
    v-if="check.candidates.value.length"
    title="可能已收录"
    :count="check.matches.value.length"
  >
    <template #icon><CopyCheck /></template>
    <Stack gap="sm">
      <template v-for="item in check.matches.value" :key="item.id">
        <Inline v-if="isDismissed(item)" gap="sm" align="center" :wrap="false">
          <Text size="sm" tone="muted" truncate class="min-w-0 flex-1">
            已标记为{{ notSameText(resourceType) }}：{{ item.title }}
          </Text>
          <Button
            variant="ghost"
            tone="neutral"
            size="sm"
            @click="check.setDismissed(item.id, false)"
          >
            撤销
          </Button>
        </Inline>
        <CreatorDuplicateRow v-else :candidate="item">
          <Button variant="outline" tone="neutral" size="sm" @click="editInstead(item)">
            <template #icon><Pencil /></template>
            改为编辑此条目
          </Button>
          <Button
            v-if="item.level !== 'on_site'"
            variant="ghost"
            tone="neutral"
            size="sm"
            @click="check.setDismissed(item.id, true)"
          >
            {{ notSameText(resourceType) }}
          </Button>
        </CreatorDuplicateRow>
      </template>

      <Stack v-if="check.authorWorks.value.length" gap="xs">
        <Text size="sm" tone="muted">{{ authorName }}的其他作品</Text>
        <CreatorDuplicateCovers :items="check.authorWorks.value" />
        <Checkbox
          :model-value="check.authorWorksChecked.value"
          @update:model-value="value => check.setAuthorWorksChecked(!!value)"
        >
          我已查看 {{ authorName }} 的现有作品，此条目不是其中任何一部。
        </Checkbox>
      </Stack>
    </Stack>
  </Panel>
</template>
