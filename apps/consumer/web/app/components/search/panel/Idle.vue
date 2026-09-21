<script setup lang="ts">
  import { Button, Divider, IconButton, Inline, Stack, Text } from '@hina-ui/vue'
  import { History, X } from '@lucide/vue'
  import type { useSearch } from '~/features/search/composables/useSearch'
  import { searchOptionId } from '~/features/search/search'

  defineProps<{ search: ReturnType<typeof useSearch> }>()
  const emit = defineEmits<{ pick: [string] }>()
</script>

<template>
  <Stack gap="none">
    <Stack v-if="search.recent.length" as="section" gap="none">
      <Inline justify="between" align="center" class="px-3 pt-2 pb-1">
        <Text as="span" size="xs" weight="semibold" tone="muted">最近搜索</Text>
        <Button variant="link" tone="neutral" size="sm" @click="search.clearRecent()">清除</Button>
      </Inline>
      <Inline
        v-for="(kw, i) in search.recent"
        :key="kw"
        gap="none"
        align="center"
        :wrap="false"
        class="pe-1.5"
      >
        <Inline
          :id="searchOptionId(i)"
          as="button"
          type="button"
          role="option"
          :aria-selected="i === search.activeIndex"
          gap="sm"
          :wrap="false"
          class="hn-state-layer min-w-0 flex-1 hn-interactive rounded-md px-3 py-2 text-left hn-press-none"
          @click="emit('pick', kw)"
        >
          <History class="size-4 shrink-0 text-muted" />
          <Text as="span" size="sm" truncate class="min-w-0 flex-1 text-left text-inherit">
            {{ kw }}
          </Text>
        </Inline>
        <IconButton
          size="sm"
          :tooltip="false"
          :label="`删除搜索记录：${kw}`"
          @click="search.removeRecent(kw)"
        >
          <X />
        </IconButton>
      </Inline>
    </Stack>

    <Divider v-if="search.recent.length && search.trending.length" class="my-1" />

    <Stack v-if="search.trending.length" as="section" gap="none">
      <Text size="xs" weight="semibold" tone="muted" class="px-3 pt-2 pb-1">大家都在搜</Text>
      <Inline
        v-for="(t, i) in search.trending"
        :id="searchOptionId(search.recent.length + i)"
        :key="t.keyword"
        as="button"
        type="button"
        role="option"
        :aria-selected="search.recent.length + i === search.activeIndex"
        gap="sm"
        :wrap="false"
        class="hn-state-layer w-full hn-interactive rounded-md px-3 py-2 text-left hn-press-none"
        @click="emit('pick', t.keyword)"
      >
        <Text
          as="span"
          size="sm"
          weight="semibold"
          class="w-5 shrink-0 text-center tabular-nums"
          :class="rankTone(i)"
        >
          {{ i + 1 }}
        </Text>
        <Text as="span" size="sm" truncate class="min-w-0 flex-1 text-left text-inherit">
          {{ t.keyword }}
        </Text>
      </Inline>
    </Stack>

    <Text
      v-if="!search.recent.length && !search.trending.length"
      size="sm"
      tone="muted"
      class="px-3 py-6 text-center"
    >
      输入作品 / 角色 / 人物名开始搜索
    </Text>
  </Stack>
</template>
