<script setup lang="ts">
  import { Button, FormLayout } from '@hina-ui/vue'
  import type { MangaTarget } from '~/features/contribute/manga-target'
  import StartForm from './StartForm.vue'

  defineProps<{ series: MangaTarget | null }>()

  const form = useTemplateRef<InstanceType<typeof StartForm>>('form')
</script>

<template>
  <FormLayout>
    <StartForm ref="form" :series="series" />
    <Button :loading="form?.submitting" :disabled="!form?.ready" @click="form?.submit()">
      开始
    </Button>
  </FormLayout>
</template>
