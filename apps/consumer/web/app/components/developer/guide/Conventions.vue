<script setup lang="ts">
  import type { DevelopersDocsPageData } from '~~/server/api/pages/developers/docs.get'
  import { OPEN_ERRORS, RATE_LIMIT_HEADERS } from '~/features/developer/guide'

  defineOptions({ name: 'DeveloperGuideConventions' })
  defineProps<{ guide: DevelopersDocsPageData }>()
</script>

<template>
  <section
    id="conventions"
    class="flex scroll-mt-[calc(var(--app-header-height)+16px)] flex-col gap-5"
  >
    <div class="flex flex-col gap-2">
      <h2 class="text-2xl font-bold text-color">响应约定</h2>
      <p class="text-sm leading-relaxed text-muted-color">
        所有响应均使用统一信封，业务数据位于
        <code class="font-mono">data</code>
        字段。端点参考中的响应示例展示的即为该字段的内容；204 响应没有响应体。
      </p>
    </div>

    <div class="flex flex-col gap-2">
      <h3 class="text-base font-semibold text-color">成功</h3>
      <DeveloperCodeBlock
        :code="guide.snippets.success_envelope.code"
        :html="guide.snippets.success_envelope.html"
      />
    </div>

    <div class="flex flex-col gap-2">
      <h3 class="text-base font-semibold text-color">分页</h3>
      <p class="text-sm leading-relaxed text-muted-color">
        分页信息位于
        <code class="font-mono">data.meta</code>
        ，与
        <code class="font-mono">items</code>
        同级，而非信封顶层。
      </p>
      <DeveloperCodeBlock
        :code="guide.snippets.paged_envelope.code"
        :html="guide.snippets.paged_envelope.html"
      />
    </div>

    <div class="flex flex-col gap-2">
      <h3 class="text-base font-semibold text-color">失败</h3>
      <p class="text-sm leading-relaxed text-muted-color">
        失败响应不含
        <code class="font-mono">data</code>
        ，改为
        <code class="font-mono">error</code>
        ；
        <code class="font-mono">code</code>
        为稳定的业务错误码，可用于分支判断。
      </p>
      <DeveloperCodeBlock
        :code="guide.snippets.error_envelope.code"
        :html="guide.snippets.error_envelope.html"
      />
    </div>

    <div class="flex flex-col gap-3">
      <h3 class="text-base font-semibold text-color">错误码</h3>
      <div class="flex flex-col divide-y divide-surface-100 dark:divide-surface-800">
        <div
          v-for="row in OPEN_ERRORS"
          :key="`${row.status}-${row.code}`"
          class="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-[3rem_minmax(0,14rem)_1fr] sm:gap-4"
        >
          <span class="font-mono text-sm font-semibold text-color">{{ row.status }}</span>
          <code class="font-mono text-xs break-words text-muted-color">{{ row.code }}</code>
          <span class="text-sm leading-relaxed text-muted-color">{{ row.when }}</span>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <h3 class="text-base font-semibold text-color">限流</h3>
      <p class="text-sm leading-relaxed text-muted-color">
        限流以应用为单位计数，默认 60 次 / 分钟，超出返回 429
        <code class="font-mono">COMMON_RATE_LIMITED</code>
        。配额为应用级：同一应用代表不同用户发起的调用共享同一配额，批量同步场景需自行控制并发与节奏。
      </p>
      <p class="text-sm leading-relaxed text-muted-color">
        每个响应均携带以下响应头，描述的是该应用的配额而非来源 IP 的配额；四者均已列入
        <code class="font-mono">Access-Control-Expose-Headers</code>
        ，浏览器端应用可直接读取。请依据
        <code class="font-mono">Retry-After</code>
        退避，不要固定间隔重试。
      </p>
      <div class="flex flex-col divide-y divide-surface-100 dark:divide-surface-800">
        <div
          v-for="row in RATE_LIMIT_HEADERS"
          :key="row.name"
          class="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-4"
        >
          <code class="font-mono text-xs break-words text-muted-color">{{ row.name }}</code>
          <span class="text-sm leading-relaxed text-muted-color">{{ row.when }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
