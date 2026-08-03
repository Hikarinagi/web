<script setup lang="ts">
  import { ChevronRight, Search } from '@lucide/vue'
  import { GUIDE_SECTIONS } from '~/features/developer/guide'
  import type { ReferenceGroup } from '~~/server/features/developer/reference'

  defineOptions({ name: 'DeveloperDocsNav' })

  const props = defineProps<{ groups: ReferenceGroup[]; activeId: string; scrollClass: string }>()
  const emit = defineEmits<{ navigate: [] }>()

  const keyword = ref('')
  const collapsed = ref(new Set<string>())
  const needle = computed(() => keyword.value.trim().toLowerCase())

  const sections = computed(() =>
    needle.value
      ? GUIDE_SECTIONS.filter(section => section.title.toLowerCase().includes(needle.value))
      : GUIDE_SECTIONS,
  )

  const matched = computed(() =>
    props.groups
      .map(group => ({
        ...group,
        operations: needle.value
          ? group.operations.filter(operation =>
              [operation.path, operation.summary ?? '', operation.method, ...operation.scopes]
                .join(' ')
                .toLowerCase()
                .includes(needle.value),
            )
          : group.operations,
      }))
      .filter(group => group.operations.length > 0),
  )

  const empty = computed(() => !sections.value.length && !matched.value.length)
  const isOpen = (tag: string) => needle.value !== '' || !collapsed.value.has(tag)

  function toggle(tag: string) {
    const next = new Set(collapsed.value)
    if (next.has(tag)) next.delete(tag)
    else next.add(tag)
    collapsed.value = next
  }

  const methodClass = (method: string) => {
    if (method === 'GET') return 'text-hikari-primary-600 dark:text-hikari-primary-400'
    if (method === 'DELETE') return 'text-red-600 dark:text-red-400'
    return 'text-amber-600 dark:text-amber-400'
  }

  const search = useTemplateRef<{ $el: HTMLInputElement }>('search')
  onKeyStroke('/', event => {
    const target = event.target as HTMLElement | null
    if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return
    event.preventDefault()
    search.value?.$el?.focus()
  })

  const list = useTemplateRef<HTMLElement>('list')
  watch(
    () => props.activeId,
    async () => {
      await nextTick()
      list.value?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest' })
    },
  )

  const linkClass = (id: string) =>
    id === props.activeId
      ? 'bg-emphasis font-medium text-color'
      : 'text-muted-color hover:bg-emphasis hover:text-color'
</script>

<template>
  <div class="flex flex-col gap-3">
    <IconField>
      <InputText
        ref="search"
        v-model="keyword"
        fluid
        size="small"
        autocomplete="off"
        placeholder="搜索文档与端点"
        aria-label="搜索文档与端点"
        @keydown.esc="keyword = ''"
      />
      <InputIcon><Search class="size-4" /></InputIcon>
    </IconField>

    <ScrollArea :class="scrollClass" shadow="none">
      <div ref="list" class="flex flex-col gap-5">
        <p v-if="empty" class="px-2 py-6 text-center text-sm text-muted-color">没有匹配的内容</p>
        <div v-if="sections.length" class="flex flex-col gap-1">
          <p
            class="px-2 pb-1 font-mono text-xs font-semibold tracking-widest text-muted-color uppercase"
          >
            接入指南
          </p>
          <Button
            v-for="section in sections"
            :key="section.id"
            unstyled
            as="a"
            :href="`#${section.id}`"
            :aria-current="section.id === activeId ? 'true' : undefined"
            class="rounded-md px-2 py-1.5 text-left text-sm transition-colors"
            :class="linkClass(section.id)"
            @click="emit('navigate')"
          >
            {{ section.title }}
          </Button>
        </div>

        <div v-if="matched.length" class="flex flex-col gap-3">
          <Button
            unstyled
            as="a"
            href="#reference"
            :aria-current="activeId === 'reference' ? 'true' : undefined"
            class="rounded-md px-2 py-1 text-left font-mono text-xs font-semibold tracking-widest uppercase transition-colors"
            :class="
              activeId === 'reference'
                ? 'bg-emphasis text-color'
                : 'text-muted-color hover:bg-emphasis hover:text-color'
            "
            @click="emit('navigate')"
          >
            端点参考
          </Button>

          <div v-for="group in matched" :key="group.tag" class="flex flex-col gap-1">
            <Button
              unstyled
              class="flex items-center gap-1.5 rounded-md px-2 py-1 text-left transition-colors hover:bg-emphasis"
              :aria-expanded="isOpen(group.tag)"
              @click="toggle(group.tag)"
            >
              <ChevronRight
                class="size-3.5 shrink-0 text-muted-color transition-transform"
                :class="isOpen(group.tag) ? 'rotate-90' : ''"
              />
              <span class="text-sm font-medium text-color">{{ group.title }}</span>
              <span class="ml-auto font-mono text-xs text-muted-color">
                {{ group.operations.length }}
              </span>
            </Button>

            <template v-if="isOpen(group.tag)">
              <Button
                v-for="operation in group.operations"
                :key="operation.id"
                unstyled
                as="a"
                :href="`#${operation.id}`"
                :aria-current="operation.id === activeId ? 'true' : undefined"
                class="flex items-baseline gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
                :class="linkClass(operation.id)"
                @click="emit('navigate')"
              >
                <span
                  class="w-11 shrink-0 font-mono text-xs font-semibold"
                  :class="methodClass(operation.method)"
                >
                  {{ operation.method }}
                </span>
                <span class="truncate">{{ operation.summary }}</span>
              </Button>
            </template>
          </div>
        </div>
      </div>
    </ScrollArea>
  </div>
</template>
