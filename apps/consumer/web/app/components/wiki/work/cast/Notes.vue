<script setup lang="ts">
  import { Inline, Link, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'

  defineOptions({ name: 'WikiWorkCastNotes' })

  const props = defineProps<{ appearance: number; twins: number[] }>()
  const cast = useCastEntry(() => props.appearance)
</script>

<template>
  <Stack gap="xs">
    <WikiFieldBefore
      v-if="cast.touched('LABEL') && cast.field('LABEL')"
      :view="cast.view('LABEL')"
      :definition="cast.field('LABEL')!"
    />
    <Text v-if="cast.others.value" size="xs" tone="muted">
      另有 {{ cast.others.value }} 个名字
    </Text>
    <Inline v-if="twins.length && cast.name.value" gap="sm" align="baseline">
      <Text size="xs" tone="warning">本作中另有 {{ twins.length }} 个同名的出场角色</Text>
      <Link
        v-if="appearance > 0 && twins[0]! > 0"
        :as="NuxtLink"
        :to="`/entries/${appearance}/merge/${twins[0]}`"
        class="text-xs"
      >
        合并
      </Link>
    </Inline>
  </Stack>
</template>
