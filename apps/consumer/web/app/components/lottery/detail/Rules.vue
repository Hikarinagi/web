<script setup lang="ts">
  import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    Heading,
    Stack,
    Text,
    Time,
  } from '@hina-ui/vue'
  import type { LotteryPageData } from '~~/server/api/pages/lotteries/[id].get'

  defineProps<{ lottery: LotteryPageData['lottery'] }>()

  const { t } = useLocaleText()
</script>

<template>
  <Stack as="section" gap="md">
    <Heading :level="2" size="lg">{{ t('lottery.rules.title') }}</Heading>
    <Accordion type="multiple">
      <AccordionItem value="join">
        <AccordionTrigger>{{ t('lottery.rules.conditions') }}</AccordionTrigger>
        <AccordionContent>
          <Stack gap="xs">
            <Text
              v-for="(item, index) in lottery.conditions"
              :key="item.kind"
              as="p"
              size="sm"
              class="m-0!"
            >
              {{ index + 1 }}.
              {{
                item.kind === 'PRESET' ? lottery.preset_label : t(`lottery.condition.${item.kind}`)
              }}
            </Text>
            <Text as="p" size="sm" tone="muted" class="m-0! pt-1 leading-relaxed">
              {{
                lottery.min_account_days > 0
                  ? t('lottery.rules.limitsWithAge', { days: lottery.min_account_days })
                  : t('lottery.rules.limits')
              }}
            </Text>
          </Stack>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="time">
        <AccordionTrigger>{{ t('lottery.rules.time') }}</AccordionTrigger>
        <AccordionContent>
          <LotteryDetailSchedule :lottery="lottery" />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="draw">
        <AccordionTrigger>{{ t('lottery.claim') }}</AccordionTrigger>
        <AccordionContent>
          <Stack gap="sm">
            <Text as="p" size="sm" tone="muted" class="m-0! leading-relaxed">
              {{ t('lottery.rules.delivery', { days: lottery.claim_days }) }}
            </Text>
            <Text
              v-if="lottery.standby_count > 0"
              as="p"
              size="sm"
              tone="muted"
              class="m-0! leading-relaxed"
            >
              {{
                lottery.refill
                  ? t('lottery.rules.standbyRefill', { count: lottery.standby_count })
                  : t('lottery.rules.standby', { count: lottery.standby_count })
              }}
            </Text>
          </Stack>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="fair">
        <AccordionTrigger>{{ t('lottery.rules.method') }}</AccordionTrigger>
        <AccordionContent>
          <LotteryDetailFairness :lottery="lottery" />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="host">
        <AccordionTrigger>{{ t('lottery.rules.contact') }}</AccordionTrigger>
        <AccordionContent>
          <Text as="p" size="sm" tone="muted" class="m-0!">{{ lottery.contact }}</Text>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
    <Text as="p" size="xs" tone="faint" class="m-0!">
      <LocaleMessage keypath="lottery.rules.locked">
        <template #time><Time :value="lottery.published_at" /></template>
      </LocaleMessage>
    </Text>
  </Stack>
</template>
