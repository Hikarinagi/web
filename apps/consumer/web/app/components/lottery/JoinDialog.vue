<script setup lang="ts">
  import { Button, Dialog, Stack, Text } from '@hina-ui/vue'
  import type { useLotteryEntry } from '~/features/lottery/useLotteryEntry'

  const props = defineProps<{ entry: ReturnType<typeof useLotteryEntry> }>()

  const { t } = useLocaleText()
  const { lottery, ineligible, dialogOpen, flagged, joining, following, join, follow } = props.entry
</script>

<template>
  <Dialog v-model:open="dialogOpen" :title="t('lottery.joinTitle')" size="sm">
    <template #content>
      <Stack gap="md">
        <LotteryConditions
          :lottery="lottery"
          :flagged="flagged"
          :following="following"
          @follow="follow"
          @comment="dialogOpen = false"
        />
        <Text v-if="ineligible" as="p" size="sm" tone="danger" class="m-0!">
          {{ ineligible }}
        </Text>
      </Stack>
    </template>
    <template #footer>
      <Button variant="ghost" tone="neutral" @click="dialogOpen = false">
        {{ t('common.cancel') }}
      </Button>
      <Button v-if="!lottery.viewer.ineligible" :loading="joining" @click="join">
        {{ t('lottery.join') }}
      </Button>
    </template>
  </Dialog>
</template>
