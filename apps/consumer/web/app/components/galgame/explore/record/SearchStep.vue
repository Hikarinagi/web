<script setup lang="ts">
  import { Empty, IconButton, Input, InputGroup, Skeleton, Stack, Text } from '@hina-ui/vue'
  import { Search } from '@lucide/vue'
  import { motion } from 'motion-v'
  import { TRANSITION } from '~/lib/motion'
  import type { GalgameSummary } from '~/features/galgame/explore'

  defineOptions({ name: 'GalgameExploreRecordSearchStep' })

  const query = defineModel<string>('query', { required: true })
  defineProps<{
    results: GalgameSummary[]
    selectedId?: number
    searching: boolean
    searched: boolean
  }>()
  const emit = defineEmits<{ select: [item: GalgameSummary] }>()
</script>

<template>
  <Stack gap="md" class="min-h-105">
    <Text size="sm" tone="muted">搜索要记录游玩状态的视觉小说</Text>

    <InputGroup>
      <Input v-model="query" autofocus placeholder="作品名 / 别名 / ID" />
      <IconButton label="搜索" variant="ghost" tone="neutral" :loading="searching">
        <Search />
      </IconButton>
    </InputGroup>

    <Stack gap="sm">
      <template v-if="searching">
        <Skeleton v-for="index in 4" :key="index" class="h-24 rounded-lg" />
      </template>
      <template v-else>
        <motion.div
          v-for="(item, index) in results"
          :key="item.id"
          :initial="{ opacity: 0, y: 10 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ ...TRANSITION, delay: index * 0.025 }"
        >
          <GalgameExploreRecordWorkCard
            :item="item"
            :selected="selectedId === item.id"
            @select="emit('select', $event)"
          />
        </motion.div>
      </template>
    </Stack>

    <Empty
      v-if="searched && !searching && results.length === 0"
      size="sm"
      title="没有搜到匹配作品"
      description="可以换原名、别名或数字 ID 再试"
    />
  </Stack>
</template>
