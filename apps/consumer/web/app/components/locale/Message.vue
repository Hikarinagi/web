<script setup lang="ts">
  import { Translation } from 'vue-i18n'
  import type { MessageKey } from '~~/i18n/keys'

  defineOptions({ name: 'LocaleMessage' })

  defineProps<{ keypath: MessageKey; params?: Record<string, unknown> }>()
</script>

<template>
  <Translation :keypath="keypath" scope="global">
    <template v-for="(value, name) in params" #[name]>{{ value }}</template>
    <template v-for="name in Object.keys($slots)" #[name]><slot :name="name" /></template>
  </Translation>
</template>
