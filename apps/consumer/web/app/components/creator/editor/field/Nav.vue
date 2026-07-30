<script setup lang="ts">
  import type { BackendEditorField } from '~/features/creator/editor'
  import type { EditorFieldPresentation } from '~/features/creator/editor/presentation'

  const props = defineProps<{
    fields: BackendEditorField[]
    presentation: Record<string, EditorFieldPresentation>
    changedFields: Set<string>
  }>()
  const emit = defineEmits<{ navigate: [] }>()

  const active = ref(props.fields[0]?.field ?? '')
  const navEl = useTemplateRef<HTMLElement>('navEl')

  function label(field: BackendEditorField) {
    return props.presentation[field.field]?.label ?? field.field
  }

  function jumpTo(name: string) {
    void navigateTo({ hash: `#editor-field-${name}` }, { replace: true })
    emit('navigate')
  }

  function followActive(name: string) {
    const container = navEl.value
    const target = container?.querySelector<HTMLElement>(`[data-nav-field="${name}"]`)
    if (!container || !target) return
    const box = container.getBoundingClientRect()
    const item = target.getBoundingClientRect()
    if (item.top < box.top) {
      container.scrollTo({
        top: container.scrollTop - (box.top - item.top) - 8,
        behavior: 'smooth',
      })
    } else if (item.bottom > box.bottom) {
      container.scrollTo({
        top: container.scrollTop + (item.bottom - box.bottom) + 8,
        behavior: 'smooth',
      })
    }
  }
  watch(active, followActive, { flush: 'post' })

  let observer: IntersectionObserver | null = null
  const visible = new Set<string>()

  onMounted(() => {
    observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          const name = entry.target.getAttribute('data-editor-field')
          if (!name) continue
          if (entry.isIntersecting) visible.add(name)
          else visible.delete(name)
        }
        const first = props.fields.find(field => visible.has(field.field))
        if (first) active.value = first.field
      },
      { rootMargin: '-76px 0px -65% 0px' },
    )
    for (const field of props.fields) {
      const el = document.getElementById(`editor-field-${field.field}`)
      if (el) observer.observe(el)
    }
  })

  onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <nav
    ref="navEl"
    class="flex max-h-[calc(100dvh-7rem)] flex-col gap-0.5 overflow-y-auto lg:max-h-[calc(100vh-13rem)]"
  >
    <Button
      v-for="field in fields"
      :key="field.field"
      unstyled
      :data-nav-field="field.field"
      :class="[
        'flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors',
        active === field.field
          ? 'bg-primary-50 font-medium text-primary-700 dark:bg-primary-500/15 dark:text-primary-300'
          : 'text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800',
      ]"
      @click="jumpTo(field.field)"
    >
      <span class="truncate">{{ label(field) }}</span>
      <span
        v-if="changedFields.has(field.field)"
        class="ml-auto size-1.5 shrink-0 rounded-full bg-primary-500"
        aria-hidden="true"
      />
    </Button>
  </nav>
</template>
