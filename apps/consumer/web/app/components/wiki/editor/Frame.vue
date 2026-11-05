<script setup lang="ts">
  import {
    Affix,
    Container,
    Drawer,
    ScrollArea,
    Splitter,
    SplitterHandle,
    SplitterPanel,
    Stack,
  } from '@hina-ui/vue'
  import { useMediaQuery } from '@vueuse/core'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'WikiEditorFrame' })

  defineProps<{ title: string }>()
  const route = useRoute()
  const router = useRouter()
  const mounted = useMounted()
  const wide = useMediaQuery('(min-width: 1280px)')
  const narrow = computed(() => mounted.value && !wide.value)
  const active = usePageActive()
  const side = computed({
    get: () => active.value && narrow.value && Boolean(route.query.side),
    set: next => {
      if (next) return
      const { side: _side, focus: _focus, ...query } = route.query
      void router.replace({ query })
    },
  })
</script>

<template>
  <Splitter v-if="!narrow" auto-save-id="wiki-editor" class="h-full min-h-0">
    <SplitterPanel :default-size="74" :min-size="50">
      <Stack gap="none" class="h-full min-h-0">
        <ScrollArea class="min-h-0 flex-1">
          <Affix v-if="$slots.tabs" v-slot="{ affixed }" class="z-20">
            <Container size="lg" :class="cn('bg-canvas pt-3', affixed && 'border-b border-line')">
              <slot name="tabs" />
            </Container>
          </Affix>
          <Container size="lg" class="py-6">
            <Stack gap="lg"><slot /></Stack>
          </Container>
        </ScrollArea>
        <slot name="footer" />
      </Stack>
    </SplitterPanel>
    <SplitterHandle label="调整右栏宽度" />
    <SplitterPanel :default-size="26" :min-size="22" :max-size="50">
      <ScrollArea class="h-full border-s border-line bg-surface">
        <Affix v-slot="{ affixed }" class="z-20">
          <Stack :class="cn('bg-surface p-4', affixed && 'border-b border-line')">
            <slot name="header" :stacked="true" />
          </Stack>
        </Affix>
        <Stack class="p-4"><slot name="side" /></Stack>
      </ScrollArea>
    </SplitterPanel>
  </Splitter>
  <Stack v-else gap="none" class="h-full min-h-0">
    <ScrollArea class="min-h-0 flex-1">
      <Container size="lg" class="pt-4"><slot name="header" :stacked="false" /></Container>
      <Affix v-if="$slots.tabs" v-slot="{ affixed }" class="z-20">
        <Container size="lg" :class="cn('bg-canvas pt-3', affixed && 'border-b border-line')">
          <slot name="tabs" />
        </Container>
      </Affix>
      <Container size="lg" class="py-6">
        <Stack gap="lg"><slot /></Stack>
      </Container>
    </ScrollArea>
    <slot name="footer" />
    <Drawer v-model:open="side" :title="title" size="md">
      <template #content><slot name="side" /></template>
    </Drawer>
  </Stack>
</template>
