<script setup lang="ts">
  import { IconButton, Inline, Input, InputGroup, InputGroupAddon, Kbd } from '@hina-ui/vue'
  import { ChevronDown, ChevronUp, Search, X } from '@lucide/vue'
  import { useReader } from '~/features/light-novel-reader/context'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'LightNovelReaderSearchField' })

  const { search } = useReader()
  const { query, results, current, status, summons } = search
  const field = useTemplateRef<InstanceType<typeof Input>>('field')
  const modifier = /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘' : 'Ctrl'

  const count = computed(() => {
    const total = results.value.length
    if (status.value === 'empty') return '共 0 处'
    if (status.value !== 'found') return ''
    return current.value < 0 ? `共 ${total} 处` : `第 ${current.value + 1} / ${total} 处`
  })

  watch(summons, () => {
    field.value?.focus()
    field.value?.$el.querySelector('input')?.select()
  })

  function onKeydown(event: KeyboardEvent) {
    if (event.isComposing) return
    const input = event.target as HTMLInputElement
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
      event.preventDefault()
      input.select()
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      search.close()
      input.blur()
      return
    }
    const step =
      event.key === 'ArrowDown'
        ? true
        : event.key === 'ArrowUp'
          ? false
          : event.key === 'Enter'
            ? !event.shiftKey
            : null
    if (step === null) return
    event.preventDefault()
    if (query.value.trim() === search.term.value) search.step(step)
  }
</script>

<template>
  <InputGroup
    variant="secondary"
    role="search"
    data-tour="search"
    :class="cn('shrink-0', query ? 'w-80 lg:w-105' : 'w-64 lg:w-80')"
  >
    <Input
      ref="field"
      v-model="query"
      placeholder="在本书中搜索"
      aria-label="在本书中搜索"
      :loading="status === 'preparing' || status === 'searching'"
      @keydown="onKeydown"
    >
      <template #leading><Search aria-hidden="true" /></template>
    </Input>
    <InputGroupAddon v-if="!query">
      <Inline as="span" gap="xs" :wrap="false" aria-hidden="true">
        <Kbd>{{ modifier }}</Kbd>
        <Kbd>F</Kbd>
      </Inline>
    </InputGroupAddon>
    <template v-else>
      <InputGroupAddon v-if="count" class="tabular-nums">{{ count }}</InputGroupAddon>
      <IconButton
        label="上一处"
        variant="ghost"
        tone="neutral"
        :disabled="!results.length"
        @click="search.step(false)"
      >
        <ChevronUp aria-hidden="true" />
      </IconButton>
      <IconButton
        label="下一处"
        variant="ghost"
        tone="neutral"
        :disabled="!results.length"
        @click="search.step(true)"
      >
        <ChevronDown aria-hidden="true" />
      </IconButton>
      <IconButton label="关闭搜索" variant="ghost" tone="neutral" @click="search.close()">
        <X aria-hidden="true" />
      </IconButton>
    </template>
  </InputGroup>
</template>
