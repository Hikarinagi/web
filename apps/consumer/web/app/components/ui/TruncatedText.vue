<script setup lang="ts">
  import { Text } from '@hina-ui/vue'

  defineOptions({ name: 'TruncatedText', inheritAttrs: false })

  const props = defineProps<{ text: string }>()

  const element = useTemplateRef<InstanceType<typeof Text>>('element')
  const overflowing = useOverflowing(element)
</script>

<template>
  <Text ref="element" v-bind="$attrs" v-tooltip="overflowing ? props.text : null" truncate>
    {{ props.text }}
  </Text>
</template>
