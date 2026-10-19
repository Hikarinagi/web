<script setup lang="ts">
  import {
    DescriptionDetails,
    DescriptionList,
    DescriptionTerm,
    Dialog,
    Inline,
    Kbd,
    Text,
  } from '@hina-ui/vue'
  import { useReader } from '~/features/light-novel-reader/context'

  defineOptions({ name: 'LightNovelReaderShortcuts' })

  const { shell } = useReader()
  const { shortcuts } = shell
  const mac = computed(() => import.meta.client && /Mac|iPhone|iPad/.test(navigator.platform))

  const rows = computed(() => {
    const command = mac.value ? '⌘' : 'Ctrl'
    const option = mac.value ? '⌥' : 'Alt'
    return [
      { label: '下一页', keys: [['→'], ['PageDown'], ['空格']] },
      { label: '上一页', keys: [['←'], ['PageUp']] },
      { label: '第一页、最后一页', keys: [['Home'], ['End']] },
      { label: '搜索', keys: [[command, 'F']] },
      { label: '下一处、上一处搜索结果', keys: [['Enter'], ['Shift', 'Enter']] },
      { label: '添加或移除书签', keys: [[command, 'D']] },
      { label: '目录', keys: [['T']] },
      { label: '高亮列表', keys: [['N']] },
      { label: '阅读设置', keys: [['S']] },
      { label: '专注模式', keys: [['F']] },
      { label: '返回原位置', keys: [[option, '←']] },
      { label: '关闭浮层、退出专注模式', keys: [['Esc']] },
      { label: '快捷键一览', keys: [['?']] },
    ]
  })
</script>

<template>
  <Dialog v-model:open="shortcuts" title="快捷键" size="md">
    <template #content>
      <DescriptionList orientation="horizontal">
        <template v-for="row in rows" :key="row.label">
          <DescriptionTerm>{{ row.label }}</DescriptionTerm>
          <DescriptionDetails>
            <Inline gap="sm" align="center" :wrap="false">
              <Inline
                v-for="(combo, index) in row.keys"
                :key="index"
                gap="xs"
                align="center"
                :wrap="false"
              >
                <template v-for="(key, step) in combo" :key="key">
                  <Text v-if="step" size="sm" tone="faint">+</Text>
                  <Kbd>{{ key }}</Kbd>
                </template>
              </Inline>
            </Inline>
          </DescriptionDetails>
        </template>
      </DescriptionList>
    </template>
  </Dialog>
</template>
