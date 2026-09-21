<script setup lang="ts">
  import {
    Button,
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
    DisclosureIcon,
    Stack,
    Text,
  } from '@hina-ui/vue'

  defineOptions({ name: 'MangaEditionList' })
  const props = defineProps<{
    editions: { label: string; fields: Record<string, string> }[]
  }>()

  const open = ref(false)

  const rows = computed(() =>
    props.editions.map(edition => ({
      label: edition.label,
      text: ['出版社', '发售日', 'ISBN', '价格', '语言']
        .map(key => edition.fields[key])
        .filter(Boolean)
        .join(' · '),
    })),
  )
</script>

<template>
  <Collapsible v-if="rows.length" v-model:open="open" class="flex flex-col gap-1.5">
    <CollapsibleTrigger as-child>
      <Button variant="link" size="sm">
        <template #trailing><DisclosureIcon /></template>
        {{ open ? '收起' : `其他版本 ${rows.length}` }}
      </Button>
    </CollapsibleTrigger>
    <CollapsibleContent>
      <Stack as="ul" gap="none" class="gap-1">
        <Text v-for="row in rows" :key="row.label" as="li" size="xs" class="min-w-0">
          {{ row.label }}
          <Text v-if="row.text" as="span" size="xs" tone="muted" class="wrap-anywhere">
            · {{ row.text }}
          </Text>
        </Text>
      </Stack>
    </CollapsibleContent>
  </Collapsible>
</template>
