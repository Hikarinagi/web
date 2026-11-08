<script setup lang="ts">
  import { Alert, Button, Checkbox, Heading, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { DuplicateCheck } from '~/features/creator/composables/useDuplicateCheck'
  import { notSameText } from '~/features/creator/duplicates'
  import { RESOURCE_SLUG } from '~/features/creator/labels'

  const props = defineProps<{ check: DuplicateCheck; resourceType: string }>()

  const likely = computed(() =>
    props.check.candidates.value.filter(item => item.level === 'likely'),
  )
  const authorName = computed(() => {
    const work = props.check.authorWorks.value[0]
    return work?.reasons.find(reason => reason.kind === 'author')?.name || work?.author || ''
  })
  const visible = computed(
    () =>
      props.check.onSite.value.length > 0 ||
      likely.value.length > 0 ||
      props.check.authorWorks.value.length > 0,
  )
</script>

<template>
  <Stack v-if="visible" gap="sm">
    <Heading :level="3" size="sm">疑似重复</Heading>
    <Alert v-if="check.serverFound.value" tone="warning">
      保存时本站发现了疑似重复条目。请逐一确认后重新提交。
    </Alert>

    <Alert v-for="item in check.onSite.value" :key="item.id" tone="danger">
      <Stack gap="xs">
        <Text size="sm">#{{ item.id }} {{ item.title }} 已收录。</Text>
        <Button
          :as="NuxtLink"
          :to="`/create/edit/${RESOURCE_SLUG[item.resource_type]}/${item.id}`"
          variant="outline"
          tone="neutral"
          size="sm"
          class="self-start"
        >
          编辑 #{{ item.id }}
        </Button>
      </Stack>
    </Alert>

    <Checkbox
      v-for="item in likely"
      :key="item.id"
      :model-value="check.dismissed.value.includes(item.id)"
      @update:model-value="value => check.setDismissed(item.id, !!value)"
    >
      #{{ item.id }} {{ item.title }} {{ notSameText(resourceType) }}
    </Checkbox>

    <Checkbox
      v-if="check.authorWorks.value.length"
      :model-value="check.authorWorksChecked.value"
      :description="`${check.authorWorks.value.length} 部作品`"
      @update:model-value="value => check.setAuthorWorksChecked(!!value)"
    >
      我已查看 {{ authorName }} 的现有作品，此条目不是其中任何一部。
    </Checkbox>

    <Text v-if="check.blocked.value" size="sm" tone="muted">请先确认每个疑似重复条目。</Text>
  </Stack>
</template>
