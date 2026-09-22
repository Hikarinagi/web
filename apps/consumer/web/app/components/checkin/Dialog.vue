<script setup lang="ts">
  import { Dialog, Stack } from '@hina-ui/vue'

  defineOptions({ name: 'CheckinDialog' })

  const {
    visible,
    status,
    month,
    records,
    recordsMonth,
    recordsLoading,
    checking,
    makingUp,
    checkIn,
    makeUp,
    changeMonth,
    openPurchase,
  } = useCheckin()
</script>

<template>
  <Dialog v-model:open="visible" title="签到" size="md" :locked="checking || makingUp">
    <template #content>
      <Stack gap="md">
        <CheckinStreakHeader :status="status" :checking="checking" @check-in="checkIn" />
        <CheckinCalendar
          :records="records"
          :status="status"
          :month="month"
          :records-month="recordsMonth"
          :loading="recordsLoading"
          @change-month="changeMonth"
          @make-up="makeUp"
          @purchase="openPurchase"
        />
        <CheckinMakeUpBar :status="status" />
      </Stack>
    </template>
  </Dialog>
</template>
