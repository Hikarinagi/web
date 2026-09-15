<script setup lang="ts">
  import { Button, Dialog, Skeleton, Stack, Tag } from '@hina-ui/vue'
  import { useDecorationDetail } from '~/features/decoration/useDetail'

  defineOptions({ name: 'UiDecorationDetailDialog' })

  const { visible, loading, detail, owned, canBuy, buying, buy } = useDecorationDetail()
</script>

<template>
  <Dialog v-model:open="visible" :title="detail?.name ?? '装扮'" size="sm">
    <template #content>
      <Stack v-if="loading" gap="md">
        <Stack gap="sm" align="center">
          <Skeleton class="size-24 rounded-full" />
          <Skeleton class="h-3.5 w-2/5" />
        </Stack>
        <Stack gap="sm">
          <Skeleton class="h-3.5 w-full" />
          <Skeleton class="h-3.5 w-11/12" />
          <Skeleton class="h-3.5 w-2/3" />
        </Stack>
        <Skeleton class="h-14 w-full rounded-xl" />
      </Stack>

      <DecorationDetailContent v-else-if="detail" :decoration="detail" />
    </template>

    <template v-if="owned || canBuy" #footer>
      <Tag v-if="owned" pill>已拥有</Tag>
      <Button v-else variant="soft" tone="neutral" :disabled="buying" @click="buy">
        <template #icon>
          <HikariPoint aria-hidden="true" />
        </template>
        {{ detail?.price }} 购买
      </Button>
    </template>
  </Dialog>
</template>
