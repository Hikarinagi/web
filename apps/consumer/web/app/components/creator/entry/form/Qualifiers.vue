<script setup lang="ts">
  import { Button, FormField, IconButton, Inline, Input, Stack, Text } from '@hina-ui/vue'
  import { Plus, X } from '@lucide/vue'
  import type { BackendPropertyDefinition } from '~/features/creator/entry/contract'
  import type { StatementValues } from '~/features/creator/entry/schemas/statement.schema'

  defineOptions({ name: 'CreatorEntryFormQualifiers' })
  const props = defineProps<{ definition: BackendPropertyDefinition }>()
  const values = defineModel<StatementValues>('values', { required: true })

  type Key = 'version' | 'part' | 'period'
  const LABELS: Record<Key, string> = {
    version: '限定版本',
    part: '限定适用部分',
    period: '限定期间',
  }
  const keys = computed(() =>
    (['version', 'part', 'period'] as const).filter(
      key =>
        props.definition.qualifiers.includes(key) &&
        !(key === 'version' && props.definition.shape === 'credit'),
    ),
  )
  const open = reactive<Record<Key, boolean>>({
    version: values.value.versions.length > 0,
    part: Boolean(values.value.part),
    period: Boolean(values.value.period_from || values.value.period_to),
  })
  const closed = computed(() => keys.value.filter(key => !open[key]))
  function close(key: Key) {
    open[key] = false
    if (key === 'version') values.value.versions = []
    if (key === 'part') values.value.part = ''
    if (key === 'period') Object.assign(values.value, { period_from: '', period_to: '' })
  }
</script>

<template>
  <Stack v-if="keys.length" gap="md">
    <Inline v-if="open.version && keys.includes('version')" gap="sm" align="end" :wrap="false">
      <CreatorEntryFormVersions v-model="values.versions" class="min-w-0 flex-1" />
      <IconButton label="取消限定版本" variant="ghost" tone="neutral" @click="close('version')">
        <X />
      </IconButton>
    </Inline>
    <Inline v-if="open.part && keys.includes('part')" gap="sm" align="end" :wrap="false">
      <FormField name="part" label="适用部分" class="min-w-0 flex-1">
        <Input v-model="values.part" variant="secondary" placeholder="例如，第二条路线或片头曲" />
      </FormField>
      <IconButton label="取消限定适用部分" variant="ghost" tone="neutral" @click="close('part')">
        <X />
      </IconButton>
    </Inline>
    <Inline v-if="open.period && keys.includes('period')" gap="sm" align="end" :wrap="false">
      <FormField name="period_from" label="期间">
        <Input
          v-model="values.period_from"
          variant="secondary"
          class="max-w-40"
          placeholder="2012-10"
        />
      </FormField>
      <Text as="span" size="sm" tone="muted" class="pb-2">至</Text>
      <FormField name="period_to">
        <Input
          v-model="values.period_to"
          variant="secondary"
          class="max-w-40"
          placeholder="2013"
          aria-label="期间截止"
        />
      </FormField>
      <IconButton label="取消限定期间" variant="ghost" tone="neutral" @click="close('period')">
        <X />
      </IconButton>
    </Inline>
    <Inline v-if="closed.length" gap="sm">
      <Button
        v-for="key in closed"
        :key="key"
        variant="ghost"
        tone="neutral"
        size="sm"
        @click="open[key] = true"
      >
        <template #icon><Plus /></template>
        {{ LABELS[key] }}
      </Button>
    </Inline>
  </Stack>
</template>
