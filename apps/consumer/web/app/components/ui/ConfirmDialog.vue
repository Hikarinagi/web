<script setup lang="ts">
  import PrimeConfirmDialog from 'primevue/confirmdialog'
  import ConfirmDialogBody from './confirm-dialog/Body.vue'

  defineOptions({ name: 'UiConfirmDialog' })
</script>

<template>
  <PrimeConfirmDialog group="app-shell" :draggable="false">
    <template #container="{ message, closeCallback }">
      <ConfirmDialogBody :message="message" :close-callback="closeCallback" />
    </template>
  </PrimeConfirmDialog>
</template>
