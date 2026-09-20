<script setup lang="ts">
  import { TimeFormatEnum, datePartFormat } from '~/utils/time-format'

  defineOptions({ name: 'ChangelogEntry' })

  defineProps<{
    version: string
    releasedAt: string
    sections: { type: string; items: { scope: string; text: string }[] }[]
  }>()

  type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'

  const LABELS: Record<string, { text: string; severity: Severity }> = {
    added: { text: '新增', severity: 'success' },
    changed: { text: '优化', severity: 'info' },
    deprecated: { text: '已弃用', severity: 'secondary' },
    removed: { text: '移除', severity: 'danger' },
    fixed: { text: '修复', severity: 'warn' },
    security: { text: '安全', severity: 'contrast' },
  }
</script>

<template>
  <div class="flex flex-col gap-3 pb-6">
    <div class="flex items-baseline gap-2">
      <Tag :value="version" rounded class="tabular-nums" />
      <span class="text-xs text-muted-color">
        {{ datePartFormat(releasedAt, TimeFormatEnum.YYYY_M_D_CN) }}
      </span>
    </div>

    <div v-for="section in sections" :key="section.type" class="flex flex-col gap-1.5">
      <Tag
        v-if="LABELS[section.type]"
        :value="LABELS[section.type]!.text"
        :severity="LABELS[section.type]!.severity"
        class="w-fit"
      />
      <ul class="flex flex-col gap-1.5">
        <li v-for="(item, index) in section.items" :key="index" class="flex gap-2 text-sm">
          <span class="shrink-0 font-medium text-muted-color">{{ item.scope }}</span>
          <span>{{ item.text }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
