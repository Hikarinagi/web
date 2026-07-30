<script setup lang="ts">
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
  <Dialog
    v-model:visible="visible"
    modal
    :dismissable-mask="!checking && !makingUp"
    :close-on-escape="!checking && !makingUp"
    :style="{ width: '92vw', maxWidth: '420px' }"
    :pt="{ content: { class: 'px-0! pb-4!' } }"
  >
    <template #header>
      <span class="text-[17px] font-bold text-color">签到</span>
    </template>

    <div class="flex flex-col gap-4">
      <CheckinStreakHeader :status="status" :checking="checking" @check-in="checkIn" />
      <CheckinCalendar
        :records="records"
        :status="status"
        :month="month"
        :records-month="recordsMonth"
        :loading="recordsLoading"
        @change-month="changeMonth"
        @make-up="makeUp"
      />
      <CheckinMakeUpBar :status="status" />
    </div>
  </Dialog>
</template>
