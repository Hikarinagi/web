<script setup lang="ts">
  import {
    Inline,
    Section,
    Stack,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Text,
    VisuallyHidden,
  } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { dayLabel, daysBetween, weekdayLabel } from '~/features/landing/labels'
  import { topVotedMedia } from '~/utils/media/image'

  type UpdateDay = ApiData<'/api/v3/landing/mangas', 'get'>['days'][number]

  defineOptions({ name: 'LandingUpdateStage' })
  const props = defineProps<{ days: UpdateDay[]; today: string; selected: string }>()

  const value = ref(props.selected)
  const current = computed(() => props.days.find(day => day.date === value.value))
  const size = computed(() => Math.max(0, ...props.days.map(day => day.items.length)))
  const hash = computed(() => topVotedMedia(current.value?.items[0]?.covers)?.thumb_hash ?? null)
  const relative = (date: string) => {
    const diff = daysBetween(date, props.today)
    return diff === 0 ? '今天' : diff === 1 ? '昨天' : ''
  }
</script>

<template>
  <Section class="relative isolate">
    <LandingBackdrop :id="value" :hash="hash" />
    <Tabs v-model="value" variant="underline" size="sm">
      <Stack
        gap="lg"
        class="mx-auto w-full max-w-(--entry-container) px-4 pt-(--landing-stage-top) pb-12 lg:px-6"
      >
        <VisuallyHidden as="h2">每日更新</VisuallyHidden>
        <Inline align="center" justify="between" gap="md" class="gap-y-2">
          <TabsList>
            <TabsTrigger v-for="day in days" :key="day.date" :value="day.date" class="tabular-nums">
              <template v-if="relative(day.date)">{{ relative(day.date) }}</template>
              <Text v-else as="span" size="inherit">
                <Text as="span" size="inherit" class="hidden sm:inline">{{
                  dayLabel(day.date)
                }}</Text
                >{{ weekdayLabel(day.date) }}
              </Text>
            </TabsTrigger>
          </TabsList>
        </Inline>
        <TabsContent v-for="day in days" :key="day.date" :value="day.date">
          <LandingUpdateDay :day="day" :size="size" />
        </TabsContent>
      </Stack>
    </Tabs>
  </Section>
</template>
