<script setup lang="ts">
  import { referenceGroups } from '~/features/developer/reference'

  defineOptions({ name: 'DeveloperReferenceViewer' })
  defineProps<{ issuer: string }>()

  const groups = referenceGroups(useRequestURL().origin)
</script>

<template>
  <div class="mx-auto box-content flex max-w-app items-start gap-10 px-6 py-10">
    <DeveloperReferenceSidebar :groups class="hidden lg:block" />

    <div class="flex min-w-0 flex-1 flex-col gap-14">
      <DeveloperReferenceIntro :issuer />

      <section v-for="group in groups" :key="group.tag" class="flex flex-col gap-2">
        <h2 class="text-2xl font-bold text-color">{{ group.title }}</h2>
        <p v-if="group.description" class="text-sm text-muted-color">{{ group.description }}</p>

        <DeveloperReferenceOperation
          v-for="operation in group.operations"
          :key="operation.id"
          :operation
        />
      </section>
    </div>
  </div>
</template>
