<script setup lang="ts">
  import {
    Button,
    Checkbox,
    FormField,
    Inline,
    Rating,
    Stack,
    Tag,
    Text,
    Textarea,
  } from '@hina-ui/vue'
  import { ArrowLeft } from '@lucide/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import { TRANSITION } from '~/lib/motion'
  import type { GalgameSummary } from '~/features/galgame/explore'
  import { titleOf } from '~/features/galgame/explore'
  import type { GalgameRateStatus } from '~/features/galgame/rate'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'GalgameExploreRecordStep' })

  const props = defineProps<{
    selected: GalgameSummary
    loadingRate: boolean
    saving: boolean
  }>()
  defineEmits<{ back: [] }>()
  const status = defineModel<GalgameRateStatus>('status', { required: true })
  const score = defineModel<number>('score', { required: true })
  const content = defineModel<string>('content', { required: true })
  const spoiler = defineModel<boolean>('spoiler', { required: true })

  const selectedTitle = computed(() => titleOf(props.selected))
  const selectedCover = computed(() => topVotedMedia(props.selected.covers))
  const shouldRate = computed(() => status.value !== 'PLAN')
</script>

<template>
  <Stack gap="lg" class="min-h-105">
    <Button
      variant="ghost"
      tone="neutral"
      size="sm"
      class="w-fit"
      :disabled="saving"
      @click="$emit('back')"
    >
      <template #icon><ArrowLeft /></template>
      换一部
    </Button>

    <Inline gap="sm" align="center" class="rounded-lg bg-subtle p-3">
      <HikariImage
        :src="selectedCover"
        :alt="selectedTitle"
        class="h-20 w-15 shrink-0 overflow-hidden rounded-md border border-line bg-inset"
        image-class="size-full object-cover object-top"
        :processing="{ width: 160, height: 216, fit: 'cover', quality: 82 }"
        :lazy="true"
        :skeleton="false"
      />
      <Stack gap="xs" class="min-w-0 flex-1">
        <Text as="span" weight="semibold" truncate>{{ selectedTitle }}</Text>
        <Text as="span" size="sm" tone="muted">
          {{ loadingRate ? '正在读取已有记录…' : '选择一个最贴近当前进度的状态' }}
        </Text>
      </Stack>
    </Inline>

    <GalgameExploreRecordStatusPicker v-model="status" />

    <AnimatePresence :initial="false">
      <motion.div
        v-if="shouldRate"
        key="rate-fields"
        :initial="{ opacity: 0, height: 0 }"
        :animate="{ opacity: 1, height: 'auto' }"
        :exit="{ opacity: 0, height: 0 }"
        :transition="TRANSITION"
        class="-mx-3 overflow-hidden px-3"
      >
        <Stack gap="md" class="pt-1">
          <FormField label="总分">
            <Inline gap="sm" align="center">
              <Rating v-model="score" :max="10" :step="1" />
              <Tag tone="warning" class="tabular-nums">{{ score.toFixed(1) }}</Tag>
            </Inline>
          </FormField>

          <FormField label="一句话短评">
            <Textarea
              v-model="content"
              autosize
              maxlength="2000"
              placeholder="哪里打动你，或者哪里劝退你？一句话也行。"
            />
          </FormField>

          <Checkbox v-model="spoiler">包含剧透</Checkbox>
        </Stack>
      </motion.div>
    </AnimatePresence>
  </Stack>
</template>
