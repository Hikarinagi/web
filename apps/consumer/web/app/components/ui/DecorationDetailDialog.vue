<script setup lang="ts">
  import { useDecorationDetail } from '~/features/decoration/useDetail'

  defineOptions({ name: 'UiDecorationDetailDialog' })

  const { visible, loading, detail, owned, canBuy, buying, buy } = useDecorationDetail()
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    dismissable-mask
    :draggable="false"
    :header="detail?.name ?? '装扮'"
    :style="{ width: '92vw', maxWidth: '340px' }"
  >
    <div v-if="loading" class="flex flex-col gap-4">
      <div class="flex flex-col items-center gap-2">
        <Skeleton shape="circle" width="6rem" height="6rem" />
        <Skeleton width="40%" height="0.9rem" />
      </div>
      <div class="flex flex-col gap-2">
        <Skeleton width="100%" height="0.9rem" />
        <Skeleton width="92%" height="0.9rem" />
        <Skeleton width="64%" height="0.9rem" />
      </div>
      <Skeleton width="100%" height="3.5rem" border-radius="0.75rem" />
    </div>

    <DecorationDetailContent v-else-if="detail" :decoration="detail" />

    <template v-if="owned || canBuy" #footer>
      <Tag v-if="owned" value="已拥有" severity="secondary" rounded />
      <Button v-else severity="secondary" :disabled="buying" @click="buy">
        <HikariPoint class="size-4" aria-hidden="true" />
        <span class="ml-1">{{ detail?.price }} 购买</span>
      </Button>
    </template>
  </Dialog>
</template>
