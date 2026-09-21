<script setup lang="ts">
  import { DropdownMenu, DropdownMenuItem } from '@hina-ui/vue'
  import { Ellipsis, Flag } from '@lucide/vue'
  import { reportRate, type RateReportKind } from '~/features/report/rate'
  import type { ReportBody } from '~/features/report/report'

  defineOptions({ name: 'RateReportMenu' })

  const props = withDefaults(
    defineProps<{
      kind: RateReportKind
      workId: number
      rateId: number
      raterId?: number | null
      size?: 'sm' | 'md'
    }>(),
    { raterId: null, size: 'sm' },
  )

  const auth = useAuthStore()
  const { requireLogin } = useAuthGate()
  const visible = ref(false)

  const isMine = computed(() => auth.user?.id != null && props.raterId === auth.user.id)

  function open() {
    if (!requireLogin()) return
    visible.value = true
  }

  function submit(body: ReportBody) {
    return reportRate(props.kind, props.workId, props.rateId, body)
  }
</script>

<template>
  <template v-if="!isMine">
    <DropdownMenu label="评分操作" align="end">
      <IconButton label="更多" :tooltip="false" :size="size" aria-haspopup="menu">
        <Ellipsis />
      </IconButton>

      <template #content>
        <DropdownMenuItem @select="open">
          <template #icon><Flag /></template>
          举报
        </DropdownMenuItem>
      </template>
    </DropdownMenu>

    <ReportDialog v-model:visible="visible" title="举报评分" :submit="submit" />
  </template>
</template>
