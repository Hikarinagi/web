<script setup lang="ts">
  import type { ReferenceOperation } from '~/features/developer/reference'

  defineOptions({ name: 'DeveloperReferenceOperation' })
  const props = defineProps<{ operation: ReferenceOperation }>()

  const methodSeverity = computed(() => {
    if (props.operation.method === 'GET') return undefined
    if (props.operation.method === 'DELETE') return 'danger'
    return 'warn'
  })
</script>

<template>
  <article
    :id="operation.id"
    class="flex scroll-mt-[calc(var(--app-header-height)+16px)] flex-col gap-4 border-t border-surface pt-8 pb-4"
  >
    <div class="flex flex-col gap-2">
      <h3 class="text-lg font-semibold text-color">{{ operation.summary }}</h3>
      <p class="flex flex-wrap items-center gap-2 font-mono text-sm">
        <Tag :value="operation.method" :severity="methodSeverity" class="font-mono" />
        <Tag v-if="operation.paginated" value="分页" severity="secondary" />
        <span class="break-all text-color">{{ operation.path }}</span>
      </p>
      <p v-if="operation.description" class="text-sm text-muted-color">
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
            {{ param.name }}<span v-if="param.required" class="text-red-500">*</span>
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
      <h4 class="text-sm font-semibold text-color">响应数据</h4>
      <DeveloperReferenceSchemaFields :fields="operation.response" />
    </section>

    <DeveloperCodeBlock :code="operation.curl" />
  </article>
</template>
