<script setup lang="ts">
  import { DropdownMenu, DropdownMenuItem, IconButton, Kbd } from '@hina-ui/vue'
  import { Ellipsis, Flag, Keyboard } from '@lucide/vue'
  import { useReader } from '~/features/light-novel-reader/context'

  defineOptions({ name: 'LightNovelReaderMore' })

  const { shell } = useReader()
  const { phone, shortcuts, report } = shell
</script>

<template>
  <DropdownMenu label="更多" align="end">
    <IconButton label="更多" variant="ghost">
      <Ellipsis aria-hidden="true" />
    </IconButton>
    <template #content>
      <DropdownMenuItem v-if="!phone" @select="shortcuts = true">
        <template #icon><Keyboard /></template>
        快捷键
        <template #trailing><Kbd>?</Kbd></template>
      </DropdownMenuItem>
      <DropdownMenuItem @select="report = true">
        <template #icon><Flag /></template>
        报告渲染问题
      </DropdownMenuItem>
    </template>
  </DropdownMenu>
</template>
