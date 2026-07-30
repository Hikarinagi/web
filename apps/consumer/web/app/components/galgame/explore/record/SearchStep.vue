<script setup lang="ts">
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
  <div class="flex min-h-[420px] flex-col gap-4 px-6 py-5">
    <div class="flex flex-col gap-1.5">
      <h2 class="text-lg font-bold text-surface-950 dark:text-surface-50">选择作品</h2>
      <p class="text-sm text-surface-500 dark:text-surface-400">搜索要记录游玩状态的视觉小说。</p>
    </div>

    <InputGroup>
      <InputText v-model="query" autofocus placeholder="作品名 / 别名 / ID" />
      <Button severity="secondary" :loading="searching" aria-label="搜索">
        <Search class="size-4" />
      </Button>
    </InputGroup>

    <div class="flex flex-col gap-2.5">
      <template v-if="searching">
        <Skeleton v-for="index in 4" :key="index" height="94px" border-radius="8px" />
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
    </div>

    <Message v-if="searched && !searching && results.length === 0" severity="secondary">
      没有搜到匹配作品，可以换原名、别名或数字 ID 再试。
    </Message>
  </div>
</template>
