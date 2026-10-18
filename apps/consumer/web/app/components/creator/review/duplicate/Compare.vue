<script setup lang="ts">
  import { Grid, Text } from '@hina-ui/vue'
  import { isEntityType, type submittedFacts } from '~/features/creator/duplicates'

  type Facts = ReturnType<typeof submittedFacts>

  const props = defineProps<{ resourceType: string; columns: Facts[] }>()
  const cols = computed(() => (props.columns.length + 1) as 2 | 3 | 4 | 5)

  const rows = computed(() => {
    const entity = isEntityType(props.resourceType)
    const all: { key: keyof Facts; label: string }[] = [
      { key: 'title', label: entity ? '名称' : '原名' },
      { key: 'subtitle', label: entity ? '译名' : '中文名' },
      { key: 'author', label: props.resourceType === 'GALGAME' ? '品牌' : '作者' },
      { key: 'label', label: '文库' },
      { key: 'year', label: '首次出版' },
      { key: 'bangumi_id', label: 'Bangumi 编号' },
      { key: 'volumes', label: '卷数' },
    ]
    return all.filter(row => props.columns.some(column => column[row.key] != null))
  })
</script>

<template>
  <Grid :cols="cols" gap="sm" class="items-start">
    <Text size="sm" tone="muted">封面</Text>
    <HikariImage
      v-for="(column, index) in columns"
      :key="`cover-${index}`"
      :src="column.cover ?? ''"
      alt=""
      preset="small"
      class="h-28 w-20 rounded bg-subtle"
      image-class="size-full object-cover"
    >
      <template #empty />
      <template #error />
    </HikariImage>

    <template v-for="row in rows" :key="row.key">
      <Text size="sm" tone="muted">{{ row.label }}</Text>
      <Text
        v-for="(column, index) in columns"
        :key="`${row.key}-${index}`"
        size="sm"
        class="break-all"
      >
        {{ column[row.key] ?? '—' }}
      </Text>
    </template>
  </Grid>
</template>
