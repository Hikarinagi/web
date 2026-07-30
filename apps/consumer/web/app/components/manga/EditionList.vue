<script setup lang="ts">
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
  <div v-if="rows.length" class="flex flex-col gap-1.5">
    <Button
      unstyled
      class="w-fit cursor-pointer text-xs text-hikari-primary-600 transition-colors hover:text-hikari-primary-700 dark:text-hikari-primary-400"
      @click="open = !open"
    >
      {{ open ? '收起' : `其他版本 ${rows.length}` }}
    </Button>
    <ul v-if="open" class="flex flex-col gap-1">
      <li v-for="row in rows" :key="row.label" class="min-w-0 text-xs">
        <span class="text-surface-700 dark:text-surface-300">{{ row.label }}</span>
        <span v-if="row.text" class="wrap-anywhere text-surface-500 dark:text-surface-400">
          · {{ row.text }}
        </span>
      </li>
    </ul>
  </div>
</template>
