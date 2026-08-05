<script setup lang="ts">
  import { Check, X } from '@lucide/vue'

  defineOptions({ name: 'DeveloperGuideBrand' })

  const NAMES = [
    {
      term: 'Hikarinagi',
      detail: '平台的正式名称。例：同步游戏状态到 Hikarinagi',
    },
    {
      term: 'Hikarinagi ID',
      detail: '账号系统的名称，用于登录、授权与账号相关的表述。例：使用 Hikarinagi ID 登录',
    },
    { term: 'Hinagi', detail: '移动端应用的展示名，用于长度受限的场景。' },
    { term: 'Hina', detail: '移动端应用图标所使用的标识。' },
  ]

  const WRITING = [
    { ok: true, text: 'Hikarinagi', note: '首字母大写，其余小写' },
    { ok: false, text: 'HikariNagi', note: '驼峰写法' },
    { ok: false, text: 'hikarinagi', note: '正文中的全小写；域名、包名等技术标识符除外' },
    { ok: false, text: 'HIKARINAGI', note: '全大写' },
    { ok: false, text: '自行翻译的名称', note: '中文或日文译名' },
  ]

  const PURPOSES = [
    '标注条目数据来源为 Hikarinagi',
    '标示该入口使用 Hikarinagi ID 登录或授权',
    '在相关说明或文案中指代 Hikarinagi',
  ]

  const ASSETS = [
    {
      name: '图标',
      file: '/brand/hikarinagi-icon.webp',
      usage: '适用于方形与窄空间：按钮前缀、列表行、署名角标',
      contain: false,
    },
    {
      name: '字标',
      file: '/brand/hikarinagi-wordmark.svg',
      usage: '适用于横向空间：正文中的指代、数据来源标注',
      contain: true,
    },
    {
      name: 'Hikarinagi ID 组合标',
      file: '/brand/hikarinagi-id-lockup.svg',
      usage: '仅用于登录与授权入口',
      contain: true,
    },
  ]

  const NOTES = [
    '请勿改变标识的颜色、比例与字形，或添加描边、阴影、渐变等效果',
    '请勿将标识与其他图形组合为新的标识，或用作应用图标',
    '标识文件请从本页获取，请勿截图或反向提取',
  ]
</script>

<template>
  <section id="brand" class="flex scroll-mt-[calc(var(--app-header-height)+16px)] flex-col gap-4">
    <h2 class="text-2xl font-bold text-color">品牌与署名</h2>
    <p class="text-sm leading-relaxed text-muted-color">
      本节说明 Hikarinagi 的名称写法、标识用法与数据署名要求，以便用户区分应用的开发者与数据来源。
    </p>

    <h3 class="mt-2 text-base font-semibold text-color">名称</h3>
    <dl class="flex flex-col divide-y divide-surface-100 dark:divide-surface-800">
      <div
        v-for="item in NAMES"
        :key="item.term"
        class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[minmax(0,10rem)_1fr] sm:gap-4"
      >
        <dt class="font-mono text-sm font-medium text-color">{{ item.term }}</dt>
        <dd class="text-sm leading-relaxed text-muted-color">{{ item.detail }}</dd>
      </div>
    </dl>

    <h3 class="mt-2 text-base font-semibold text-color">书写规范</h3>
    <ul class="flex flex-col gap-2">
      <li v-for="item in WRITING" :key="item.text" class="flex items-start gap-2 text-sm">
        <Check v-if="item.ok" class="mt-0.5 size-4 shrink-0 text-hikari-primary-500" />
        <X v-else class="mt-0.5 size-4 shrink-0 text-red-500" />
        <span class="text-color">{{ item.text }}</span>
        <span class="text-muted-color">— {{ item.note }}</span>
      </li>
    </ul>

    <h3 class="mt-2 text-base font-semibold text-color">标识</h3>
    <p class="text-sm leading-relaxed text-muted-color">标识仅限用于下列用途：</p>
    <ol class="flex list-decimal flex-col gap-2 ps-5 text-sm text-muted-color">
      <li v-for="purpose in PURPOSES" :key="purpose" class="leading-relaxed">{{ purpose }}</li>
    </ol>
    <p class="text-sm leading-relaxed text-muted-color">下列文件按适用空间选用。</p>
    <div class="grid gap-3 sm:grid-cols-3">
      <div
        v-for="asset in ASSETS"
        :key="asset.file"
        class="flex flex-col gap-3 rounded-xl border border-surface p-4"
      >
        <div
          class="flex min-h-20 items-center justify-center rounded-lg bg-surface-50 p-4 dark:bg-surface-900"
        >
          <HikariImage
            :src="asset.file"
            :alt="asset.name"
            :skeleton="false"
            :class="asset.contain ? 'h-6 w-auto' : 'size-12 rounded-lg'"
            image-class="size-full object-contain"
          />
        </div>
        <div class="flex flex-col items-start gap-1">
          <p class="text-sm font-medium text-color">{{ asset.name }}</p>
          <p class="text-xs text-muted-color">{{ asset.usage }}</p>
          <Button
            :label="asset.file"
            as="a"
            :href="asset.file"
            download
            variant="link"
            size="small"
            class="-mx-2 font-mono! text-xs! break-all"
          />
        </div>
      </div>
    </div>
    <p class="text-sm leading-relaxed text-muted-color">
      横向空间不足以容纳字标或组合标时改用图标；标识缩小到难以辨认时，改用纯文字
      Hikarinagi。图标为位图，源文件为 1024×1024，放大使用不应超过该尺寸。
    </p>
    <ul class="flex list-disc flex-col gap-2 ps-5 text-sm text-muted-color">
      <li v-for="note in NOTES" :key="note" class="leading-relaxed">{{ note }}</li>
    </ul>

    <h3 class="mt-2 text-base font-semibold text-color">数据署名</h3>
    <p class="text-sm leading-relaxed text-muted-color">
      展示通过开放 API 获取的条目信息时，须标注数据来源为 Hikarinagi，并指向该条目在 Hikarinagi
      上的页面。
    </p>
  </section>
</template>
