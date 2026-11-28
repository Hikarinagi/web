<script setup lang="ts">
  import { Button, Inline, Link, Stack, Text } from '@hina-ui/vue'
  import { Circle, CircleCheck, CircleX, Dot } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import { COMMENT_SECTION_HASH } from '~/features/comment/comment'
  import type { BackendLottery } from '~/features/lottery/lottery'

  defineProps<{ lottery: BackendLottery; flagged?: boolean; following?: boolean }>()
  defineEmits<{ follow: []; comment: [] }>()

  const { t } = useLocaleText()
</script>

<template>
  <Stack gap="none" class="gap-1">
    <Inline
      v-for="item in lottery.conditions"
      :key="item.kind"
      gap="sm"
      align="center"
      :wrap="false"
      class="min-h-8"
    >
      <CircleCheck v-if="item.met === true" class="size-4 shrink-0 text-success-text" />
      <CircleX v-else-if="item.met === false && flagged" class="size-4 shrink-0 text-danger-text" />
      <Circle v-else-if="item.met === false" class="size-4 shrink-0 text-faint" />
      <Dot v-else class="size-4 shrink-0 text-faint" />
      <Text as="span" size="sm" class="min-w-0 flex-1">
        {{ item.kind === 'PRESET' ? lottery.preset_label : t(`lottery.condition.${item.kind}`) }}
      </Text>
      <template v-if="item.met === false">
        <Button
          v-if="item.kind === 'FOLLOW'"
          size="xs"
          variant="outline"
          tone="neutral"
          :loading="following"
          @click="$emit('follow')"
        >
          {{ t('lottery.follow') }}
        </Button>
        <Text v-else-if="item.kind === 'COMMENT' && lottery.post_id" as="span" size="sm">
          <Link
            :as="NuxtLink"
            :to="`/posts/${lottery.post_id}${COMMENT_SECTION_HASH}`"
            @click="$emit('comment')"
          >
            {{ t('lottery.comment') }}
          </Link>
        </Text>
      </template>
    </Inline>
  </Stack>
</template>
