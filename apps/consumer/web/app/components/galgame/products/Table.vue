<script setup lang="ts">
  import {
    Inline,
    Link,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Tag,
    Text,
  } from '@hina-ui/vue'
  import { ChevronRight } from '@lucide/vue'
  import type { BackendProductSummary } from '~/features/entry/contract'
  import { ageRatingLabel, versionKindLabel, titleText } from '~/features/entry/labels'
  import { platformLabel } from '~/features/galgame/platforms'

  defineOptions({ name: 'GalgameProductsTable' })
  withDefaults(
    defineProps<{
      products: BackendProductSummary[]
      interactive?: boolean
      variant?: 'primary' | 'secondary'
    }>(),
    { interactive: true, variant: 'primary' },
  )
  defineEmits<{ select: [id: number] }>()
</script>

<template>
  <Table :variant="variant">
    <TableHeader>
      <TableRow>
        <TableHead>版本类型</TableHead>
        <TableHead>版本标题</TableHead>
        <TableHead>平台</TableHead>
        <TableHead>发售日</TableHead>
        <TableHead>价格</TableHead>
        <TableHead>年龄分级</TableHead>
        <TableHead v-if="interactive"><span class="sr-only">发行版本详情</span></TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow
        v-for="product in products"
        :key="product.id"
        :class="interactive ? 'relative cursor-pointer' : undefined"
      >
        <TableCell>
          <Inline gap="xs" align="center">
            <Tag v-if="product.kind" tone="neutral">{{ versionKindLabel(product.kind) }}</Tag>
            <Tag v-if="product.collection" variant="outline" tone="neutral">合集</Tag>
          </Inline>
        </TableCell>
        <TableCell>
          <Link
            v-if="interactive"
            as="button"
            type="button"
            tone="neutral"
            :underline="false"
            class="text-start after:absolute after:inset-0"
            @click="$emit('select', product.id)"
          >
            {{ titleText(product.title) }}
          </Link>
          <template v-else>{{ titleText(product.title) }}</template>
        </TableCell>
        <TableCell class="whitespace-nowrap">
          {{ product.platforms.map(platformLabel).join('、') || '—' }}
        </TableCell>
        <TableCell class="whitespace-nowrap">{{ product.release?.text ?? '—' }}</TableCell>
        <TableCell class="whitespace-nowrap">
          <template v-if="product.price">
            {{ product.price.text }}
            <Text v-if="product.price.tax_included !== null" as="span" size="xs" tone="muted">
              {{ product.price.tax_included ? '含税' : '不含税' }}
            </Text>
          </template>
          <template v-else>—</template>
        </TableCell>
        <TableCell class="whitespace-nowrap">{{
          ageRatingLabel(product.age_rating) ?? '—'
        }}</TableCell>
        <TableCell v-if="interactive">
          <ChevronRight class="size-4 text-muted" aria-hidden="true" />
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
