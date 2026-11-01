<script setup lang="ts">
  import { Alert, Inline, Stack, Text } from '@hina-ui/vue'
  import type { BackendEditableEntry } from '~/features/creator/entry/contract'
  import { accessedText } from '~/features/creator/entry/values'
  import { getUserRoleLabel } from '~/labels/user'

  defineOptions({ name: 'CreatorEntryProtection' })
  const props = defineProps<{ protection: BackendEditableEntry['protection'] }>()

  const locked = computed(() => props.protection?.level === 'LOCKED')
  const role = computed(() => {
    const by = props.protection?.by
    return by && by.role !== 'USER' ? getUserRoleLabel(by.role) : '巡查者'
  })
  const when = computed(() => {
    const protection = props.protection
    if (!protection) return ''
    const action = locked.value ? '锁定此条目' : '保护此条目'
    const at = protection.at ? `于 ${accessedText(protection.at, false)} ` : ''
    const until = protection.until
      ? `，将于 ${accessedText(protection.until, false)} 自动${locked.value ? '解锁' : '解除'}`
      : ''
    return `${at}${action}${until}。`
  })
</script>

<template>
  <Alert
    :open="Boolean(protection)"
    :tone="locked ? 'warning' : 'info'"
    :title="locked ? '条目已锁定' : '新成员对本条目的编辑将在生效前公示'"
  >
    <Stack v-if="protection" gap="xs">
      <Inline gap="xs" align="center" wrap>
        <template v-if="protection.by">
          <Text as="span" size="sm">{{ role }}</Text>
          <Avatar :user="protection.by" class="size-5!" />
          <UserName :user="protection.by" class="text-sm" />
        </template>
        <Text as="span" size="sm">{{ when }}</Text>
      </Inline>
      <Text v-if="protection.reason" as="p" size="sm">原因：{{ protection.reason }}</Text>
    </Stack>
  </Alert>
</template>
