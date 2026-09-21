<script setup lang="ts">
  import { AlertDialog } from '@hina-ui/vue'

  defineOptions({ name: 'UserUnfollowDialog' })

  const props = defineProps<{ confirm: () => Promise<void> }>()
  const open = defineModel<boolean>('open', { required: true })
</script>

<template>
  <AlertDialog
    v-model:open="open"
    title="取消关注"
    description="取消关注后，TA 的更新将不再出现在你的关注流里。"
    confirm-text="取消关注"
    cancel-text="再想想"
    @confirm="props.confirm"
  />
</template>
