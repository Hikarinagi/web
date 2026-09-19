<script setup lang="ts">
  import { Code, Inline, Tag } from '@hina-ui/vue'
  import type { ReferenceAuth, ReferenceOperation } from '~~/server/features/developer/reference'

  defineOptions({ name: 'DeveloperApiEndpointLine' })
  const props = defineProps<{ operation: ReferenceOperation; auth: ReferenceAuth }>()

  const methodTone = computed(() => {
    if (props.operation.method === 'GET') return 'accent' as const
    if (props.operation.method === 'DELETE') return 'danger' as const
    return 'warning' as const
  })
</script>

<template>
  <Inline gap="sm" align="center">
    <Tag :tone="methodTone" class="font-mono">{{ operation.method }}</Tag>
    <Code class="text-sm break-all">{{ operation.path }}</Code>
    <Tag v-if="auth === 'user'" tone="neutral" size="sm">需用户授权</Tag>
    <Tag v-if="operation.paginated" tone="neutral" size="sm">分页</Tag>
    <Tag v-for="scope in operation.scopes" :key="scope" tone="neutral" size="sm" class="font-mono">
      {{ scope }}
    </Tag>
  </Inline>
</template>
