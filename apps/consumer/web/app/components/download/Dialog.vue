<script setup lang="ts">
  import { Button, Dialog, Stack } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { useDownloadDialog } from '~/features/download/useDownloadDialog'

  defineOptions({ name: 'DownloadDialog' })

  const props = defineProps<{
    flow: ReturnType<typeof useDownloadDialog>
    title: string
    unit: string
  }>()
  const slots = useSlots()
  const { open, quote, quoting, creating, purchasing, run, blocked, needsCard, canStart } =
    props.flow

  const busy = computed(() => creating.value || purchasing.value)
  const saving = computed(() => run.value?.state === 'saving' || run.value?.state === 'preparing')
  const primary = computed(() => {
    if (needsCard.value) return '购买下载卡'
    return props.flow.sink.value === 'fs' ? '保存到文件夹' : '保存到设备'
  })
</script>

<template>
  <Dialog
    v-model:open="open"
    title="下载"
    :description="title"
    :size="slots.default ? 'lg' : 'sm'"
    :locked="busy"
  >
    <template #content>
      <DownloadRun v-if="run" :run="run" />
      <Stack v-else gap="lg">
        <slot />
        <DownloadQuote :quote="quote" :quoting="quoting" :blocked="blocked" :unit="unit" />
      </Stack>
    </template>
    <template #footer>
      <template v-if="run">
        <Button :as="NuxtLink" to="/me/downloads" variant="ghost" tone="neutral">
          前往下载中心
        </Button>
        <Button v-if="saving" variant="ghost" tone="neutral" @click="flow.pause()">暂停</Button>
        <Button v-else-if="run.state === 'paused' || run.state === 'error'" @click="flow.resume()">
          继续
        </Button>
        <Button v-if="saving" @click="flow.background()">在后台继续</Button>
        <Button v-else-if="run.state === 'done'" @click="flow.background()">完成</Button>
      </template>
      <template v-else>
        <Button variant="ghost" tone="neutral" :disabled="busy" @click="open = false">取消</Button>
        <Button
          :disabled="!needsCard && !canStart"
          :loading="busy"
          class="min-w-30"
          @click="flow.save()"
        >
          {{ primary }}
        </Button>
      </template>
    </template>
  </Dialog>
</template>
