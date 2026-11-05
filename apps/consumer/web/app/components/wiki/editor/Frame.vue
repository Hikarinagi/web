<script setup lang="ts">
  import {
    Button,
    Card,
    Drawer,
    ScrollArea,
    Splitter,
    SplitterHandle,
    SplitterPanel,
    Stack,
  } from '@hina-ui/vue'
  import { PanelRight } from '@lucide/vue'
  import { useMediaQuery } from '@vueuse/core'

  defineOptions({ name: 'WikiEditorFrame' })

  const mounted = useMounted()
  const wide = useMediaQuery('(min-width: 1280px)')
  const narrow = computed(() => mounted.value && !wide.value)
  const drawer = ref(false)
</script>

<template>
  <Stack v-if="narrow" gap="md" class="min-h-0 flex-1">
    <Card>
      <Stack gap="sm">
        <slot name="header" />
        <Drawer v-model:open="drawer" title="修改记录、建议与相关条目">
          <Button variant="outline" tone="neutral" size="sm" class="self-start">
            <template #icon><PanelRight /></template>
            修改记录、建议与相关条目
          </Button>
          <template #content><slot name="side" /></template>
        </Drawer>
      </Stack>
    </Card>
    <slot name="tabs" />
    <ScrollArea class="min-h-0 flex-1">
      <Stack gap="lg"><slot /></Stack>
    </ScrollArea>
    <slot name="footer" />
  </Stack>
  <Splitter v-else auto-save-id="wiki-editor" class="min-h-0 flex-1">
    <SplitterPanel :default-size="74">
      <Stack gap="md" class="h-full min-h-0 pr-3">
        <slot name="tabs" />
        <ScrollArea class="min-h-0 flex-1">
          <Stack gap="lg"><slot /></Stack>
        </ScrollArea>
        <slot name="footer" />
      </Stack>
    </SplitterPanel>
    <SplitterHandle label="调整右栏宽度" />
    <SplitterPanel :default-size="26" :min-size="22" :max-size="50">
      <Card :padded="false" class="ml-3 h-full overflow-hidden">
        <Stack gap="none" class="h-full min-h-0">
          <Stack class="border-b border-line p-4"><slot name="header" /></Stack>
          <ScrollArea class="min-h-0 flex-1">
            <Stack class="p-4"><slot name="side" /></Stack>
          </ScrollArea>
        </Stack>
      </Card>
    </SplitterPanel>
  </Splitter>
</template>
