<script setup lang="ts">
  import type { ReferenceGroup } from '~/features/developer/reference'

  defineOptions({ name: 'DeveloperReferenceSidebar' })
  defineProps<{ groups: ReferenceGroup[] }>()
</script>

<template>
  <nav
    class="sticky top-[calc(var(--app-header-height)+24px)] w-64 shrink-0"
    aria-label="API 端点导航"
  >
    <ScrollArea class="max-h-[calc(100vh-var(--app-header-height)-48px)]">
      <div class="flex flex-col gap-5 pr-2">
        <div v-for="group in groups" :key="group.tag" class="flex flex-col gap-1">
          <p class="font-mono text-xs font-semibold tracking-widest text-muted-color uppercase">
            {{ group.title }}
          </p>
          <Button
            v-for="operation in group.operations"
            :key="operation.id"
            unstyled
            as="a"
            :href="`#${operation.id}`"
            class="flex items-baseline gap-2 rounded-md px-2 py-1.5 text-sm text-muted-color transition-colors hover:bg-emphasis"
          >
            <span
              class="w-11 shrink-0 font-mono text-xs font-semibold"
              :class="
                operation.method === 'GET'
                  ? 'text-hikari-primary-600 dark:text-hikari-primary-400'
                  : operation.method === 'DELETE'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-amber-600 dark:text-amber-400'
              "
            >
              {{ operation.method }}
            </span>
            <span class="truncate">{{ operation.summary }}</span>
          </Button>
        </div>
      </div>
    </ScrollArea>
  </nav>
</template>
