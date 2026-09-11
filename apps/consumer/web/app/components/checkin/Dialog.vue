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
          :make-up="makeUp"
          @change-month="changeMonth"
        />
        <CheckinMakeUpBar :status="status" />
      </Stack>
    </template>
  </Dialog>
</template>
