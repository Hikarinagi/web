<script setup lang="ts">
  import { Card, IconButton, Ripple, SimpleGrid, Text } from '@hina-ui/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import { Plus, X } from '@lucide/vue'
  import { TRANSITION } from '~/lib/motion'
  import { POST_MAX_COVERS } from './composables/useComposer'
  import type { MediaValue } from '~/components/media-library/types'

  defineOptions({ name: 'FeedComposerCovers' })

  defineProps<{ show: boolean; covers: MediaValue[]; coversFull: boolean }>()
  defineEmits<{ add: []; remove: [id: number] }>()
</script>

<template>
  <AnimatePresence>
    <motion.div
      v-if="show"
      key="covers"
      :initial="{ height: 0, opacity: 0 }"
      :animate="{ height: 'auto', opacity: 1 }"
      :exit="{ height: 0, opacity: 0 }"
      :transition="TRANSITION"
      class="overflow-hidden"
    >
      <SimpleGrid min="92px" gap="sm" class="py-2 pr-4 pl-16">
        <Card
          v-for="m in covers"
          :key="m.id"
          :padded="false"
          class="group/cover relative aspect-square shadow-none"
        >
          <HikariImage
            :src="m"
            alt="待发布配图"
            preset="small"
            class="size-full"
            image-class="size-full object-cover"
            :lazy="false"
            preview
          >
            <template #empty />
            <template #error />
          </HikariImage>
          <IconButton
            label="移除图片"
            :tooltip="false"
            variant="solid"
            tone="neutral"
            size="sm"
            class="absolute top-1 right-1 size-5 opacity-100 transition-opacity md:opacity-0 md:group-hover/cover:opacity-100 md:focus-visible:opacity-100"
            @click.stop="$emit('remove', m.id)"
          >
            <X :size="12" />
          </IconButton>
        </Card>
        <Card
          v-if="!coversFull"
          as="button"
          :padded="false"
          class="hn-state-layer relative flex aspect-square hn-interactive flex-col items-center justify-center gap-1 border-dashed text-muted shadow-none"
          aria-label="添加图片"
          @click.stop="$emit('add')"
        >
          <Ripple />
          <Plus :size="20" />
          <Text as="span" size="xs" class="tabular-nums">
            {{ covers.length }}/{{ POST_MAX_COVERS }}
          </Text>
        </Card>
      </SimpleGrid>
    </motion.div>
  </AnimatePresence>
</template>
