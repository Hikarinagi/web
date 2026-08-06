<script setup lang="ts">
  import { Check, Link2 } from '@lucide/vue'
  import type { ReferenceOperation } from '~~/server/features/developer/reference'

  defineOptions({ name: 'DeveloperReferenceOperation' })
  const props = defineProps<{ operation: ReferenceOperation }>()

  const methodSeverity = computed(() => {
    if (props.operation.method === 'GET') return undefined
    if (props.operation.method === 'DELETE') return 'danger'
    return 'warn'
  })

  const { copy, copied } = useClipboard()
  function copyPermalink() {
    const url = useRequestURL()
    copy(`${url.origin}${url.pathname}#${props.operation.id}`)
  }
</script>

<template>
  <article
    :id="operation.id"
    class="grid scroll-mt-[calc(var(--app-header-height)+16px)] grid-cols-1 items-start gap-8 border-t border-surface py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]"
  >
    <div class="flex min-w-0 flex-col gap-5">
      <div class="group/op flex flex-col gap-2">
        <div class="flex items-center gap-1.5">
          <h3 class="text-lg font-semibold text-color">{{ operation.summary }}</h3>
          <Button
            v-tooltip.top="copied ? '链接已复制' : '复制链接'"
            unstyled
            class="inline-flex items-center justify-center rounded p-1 text-muted-color opacity-0 transition-opacity group-hover/op:opacity-100 hover:text-color focus-visible:opacity-100 max-lg:opacity-100"
            :aria-label="copied ? '链接已复制' : '复制该端点链接'"
            @click="copyPermalink"
          >
            <Check
              v-if="copied"
              class="size-4 text-hikari-primary-600 dark:text-hikari-primary-400"
            />
            <Link2 v-else class="size-4" />
          </Button>
        </div>
        <p class="flex flex-wrap items-center gap-2 font-mono text-sm">
          <Tag :value="operation.method" :severity="methodSeverity" class="font-mono" />
          <Tag v-if="operation.paginated" value="分页" severity="secondary" />
          <Tag v-if="operation.responseIsArray" value="返回数组" severity="secondary" />
          <span class="break-all text-color">{{ operation.path }}</span>
        </p>
        <p v-if="operation.scopes.length" class="flex flex-wrap items-center gap-1.5 text-xs">
          <span class="text-muted-color">需要 scope</span>
          <Button
            v-for="scope in operation.scopes"
            :key="scope"
            v-tooltip.top="'查看该 scope 的说明'"
            unstyled
            as="router-link"
            to="/developers/docs#scopes"
            class="rounded px-1.5 py-0.5 font-mono bg-emphasis transition-colors hover:text-primary"
          >
            {{ scope }}
          </Button>
        </p>
        <p
          v-if="operation.statuses.length"
          class="flex flex-wrap items-center gap-1.5 text-xs text-muted-color"
        >
          <span>响应</span>
          <span v-for="status in operation.statuses" :key="status.code" class="font-mono">
            {{ status.code }}
            <span v-if="status.label" class="ml-1 font-sans">{{ status.label }}</span>
          </span>
        </p>
        <p v-if="operation.description" class="text-sm leading-relaxed text-muted-color">
          {{ operation.description }}
        </p>
      </div>

      <section v-if="operation.params.length" class="flex flex-col gap-2">
        <h4 class="text-sm font-semibold text-color">查询参数</h4>
        <div class="flex flex-col divide-y divide-surface-100 dark:divide-surface-800">
          <div
            v-for="param in operation.params"
            :key="param.name"
            class="grid grid-cols-1 gap-1 py-2 sm:grid-cols-3 sm:gap-3"
          >
            <span class="font-mono text-sm text-color">
              {{ param.name }}
              <span v-if="param.required" class="text-red-500">*</span>
            </span>
            <span class="font-mono text-xs break-words text-muted-color">{{ param.type }}</span>
            <span class="text-sm text-muted-color">{{ param.description }}</span>
          </div>
        </div>
      </section>

      <section v-if="operation.request?.length" class="flex flex-col gap-2">
        <h4 class="text-sm font-semibold text-color">请求体</h4>
        <DeveloperReferenceSchemaFields :fields="operation.request" />
      </section>

      <section v-if="operation.response?.length" class="flex flex-col gap-2">
        <h4 class="text-sm font-semibold text-color">响应字段</h4>
        <DeveloperReferenceSchemaFields :fields="operation.response" />
      </section>
    </div>

    <DeveloperReferenceCodePanel :operation />
  </article>
</template>
