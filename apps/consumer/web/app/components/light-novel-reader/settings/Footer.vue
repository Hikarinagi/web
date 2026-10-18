<script setup lang="ts">
  import { Button, Inline, Text } from '@hina-ui/vue'
  import { useReader } from '~/features/light-novel-reader/context'

  defineOptions({ name: 'LightNovelReaderSettingsFooter' })

  const { settings, fonts } = useReader()

  function reset() {
    settings.reset()
    void fonts.choose('original')
  }
</script>

<template>
  <Inline justify="between" align="center" gap="md" :wrap="false" class="w-full">
    <Text size="xs" tone="faint">主题与字体随账号同步，其他设置仅保存在本设备。</Text>
    <Button variant="ghost" tone="neutral" size="sm" class="shrink-0" @click="reset">
      恢复默认
    </Button>
  </Inline>
</template>
