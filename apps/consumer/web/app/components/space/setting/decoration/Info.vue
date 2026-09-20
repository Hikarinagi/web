<script setup lang="ts">
  import type { ShopDecoration } from '~/features/space/useDecoration'

  defineOptions({ name: 'SpaceSettingDecorationInfo' })

  defineProps<{ decoration: ShopDecoration }>()
</script>

<template>
  <span>
    <Question :title="decoration.name" tooltip="说明" aria-label="装扮说明">
      <DecorationDetailContent :decoration="decoration" />
    </Question>
  </span>
</template>
