<script setup lang="ts">
  import { Plus } from '@lucide/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import { push } from 'notivue'
  import { TRANSITION } from '~/lib/motion'
  import { useFavoriteCollections } from '~/features/favorite/composables/useFavoriteCollections'
  import type { FavoriteEntityType } from '~/features/favorite/entity'
  import type { CollectionValues } from '~/features/favorite/schemas/collection.schema'

  defineOptions({ name: 'FavoriteCollectionPanel' })

  const props = withDefaults(
    defineProps<{ type: FavoriteEntityType; id: number; showDone?: boolean; heading?: string }>(),
    { heading: '收藏到收藏夹' },
  )
  const emit = defineEmits<{ done: [] }>()

  const { rows, pending, failed, savingIds, load, toggleIn, create } = useFavoriteCollections(
    props.type,
    props.id,
  )
  const creating = ref(false)

  load()

  async function onToggle(collectionId: number) {
    await toggleIn(collectionId).catch(() => {})
  }

  async function onCreate(values: CollectionValues) {
    await create(values)
    closeCreate()
    push.success({ message: '已新建并收藏' })
  }

  function openCreate() {
    creating.value = true
  }

  function closeCreate() {
    creating.value = false
  }
</script>

<template>
  <div class="flex max-h-[min(70dvh,420px)] min-h-0 flex-col">
    <p class="px-4 pt-3.5 pb-3 text-[15px] leading-6 font-semibold wrap-break-word text-color">
      {{ heading }}
    </p>
    <div class="border-t border-surface-100 dark:border-surface-800" />

    <ScrollArea v-if="pending" class="min-h-0 flex-1">
      <div class="flex flex-col gap-1 p-2">
        <div v-for="i in 3" :key="i" class="flex items-center gap-2.5 px-2 py-2.5">
          <Skeleton shape="circle" size="1.125rem" />
          <Skeleton width="9rem" height="0.75rem" />
          <div class="flex-1" />
          <Skeleton width="1.75rem" height="0.75rem" />
        </div>
      </div>
    </ScrollArea>

    <div v-else-if="failed" class="flex min-h-0 flex-1 flex-col items-stretch gap-3 p-4">
      <Message severity="error" size="small" variant="simple">收藏夹加载失败</Message>
      <Button label="重试" text size="small" @click="load" />
    </div>

    <ScrollArea v-else class="min-h-0 flex-1">
      <div class="p-2">
        <FavoriteCollectionRow
          v-for="row in rows"
          :key="row.id"
          :row="row"
          :saving="savingIds.has(row.id)"
          @toggle="onToggle(row.id)"
        />
      </div>
    </ScrollArea>

    <div class="border-t border-surface-100 dark:border-surface-800" />
    <AnimatePresence :initial="false">
      <motion.div
        v-if="creating"
        key="form"
        :initial="{ height: 0, opacity: 0 }"
        :animate="{ height: 'auto', opacity: 1 }"
        :exit="{ height: 0, opacity: 0 }"
        :transition="TRANSITION"
        class="overflow-hidden"
      >
        <FavoriteCollectionCreateForm :submit="onCreate" @cancel="closeCreate" />
      </motion.div>
    </AnimatePresence>

    <AnimatePresence :initial="false">
      <motion.div
        v-if="!creating"
        key="trigger"
        :initial="{ height: 0, opacity: 0 }"
        :animate="{ height: 'auto', opacity: 1 }"
        :exit="{ height: 0, opacity: 0 }"
        :transition="TRANSITION"
        class="overflow-hidden"
      >
        <Button
          unstyled
          type="button"
          :aria-expanded="creating"
          class="flex w-full items-center gap-2 bg-transparent px-4 py-3 text-sm font-medium text-hikari-primary-700 transition-colors hover:text-hikari-primary-600"
          @click="openCreate"
        >
          <template #default>
            <Plus class="size-4" />
            <span>新建收藏夹</span>
          </template>
        </Button>
      </motion.div>
    </AnimatePresence>

    <template v-if="showDone">
      <div class="border-t border-surface-100 dark:border-surface-800" />
      <div class="p-3">
        <Button label="完成" fluid @click="emit('done')" />
      </div>
    </template>
  </div>
</template>
