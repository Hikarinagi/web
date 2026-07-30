<script setup lang="ts">
  import type { CoverVoteCandidate } from '~/features/interaction/useCoverVote'

  defineOptions({ name: 'WorkCoverVoteDialog' })

  const props = defineProps<{
    candidates: CoverVoteCandidate[]
    busy: boolean
    editPath: string
  }>()

  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ vote: [mediaId: number]; retract: [] }>()

  function pick(candidate: CoverVoteCandidate) {
    if (props.busy) return
    if (candidate.mine) emit('retract')
    else if (candidate.media?.id != null) emit('vote', candidate.media.id)
  }
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="封面投票"
    :dismissable-mask="!busy"
    :close-on-escape="!busy"
    :style="{ width: '92vw', maxWidth: '540px' }"
  >
    <div class="grid grid-cols-2 gap-4">
      <div v-for="candidate in candidates" :key="candidate.media?.id ?? candidate.votes">
        <div class="aspect-7/10 overflow-hidden rounded-lg bg-surface-100 dark:bg-surface-900">
          <HikariImage
            :src="candidate.media"
            preview
            alt=""
            class="size-full"
            image-class="object-cover"
            :processing="{ width: 480, quality: 88, fit: 'cover' }"
          />
        </div>
        <div class="mt-2 flex items-center justify-between gap-2">
          <span
            class="text-sm"
            :class="candidate.mine ? 'font-medium text-primary' : 'text-muted-color'"
          >
            {{ candidate.votes }} 票
          </span>
          <Button
            :label="candidate.mine ? '已投' : '投这张'"
            size="small"
            :severity="candidate.mine ? undefined : 'secondary'"
            :outlined="!candidate.mine"
            login-required
            :disabled="busy"
            @click="pick(candidate)"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <span class="flex items-center">
        <span class="text-sm text-muted-color">选择你认为最适合展示给大家的封面，你也可以</span>
        <Button
          as="router-link"
          :to="editPath"
          target="_blank"
          label="添加新封面"
          text
          severity="secondary"
          size="small"
        />
      </span>
    </template>
  </Dialog>
</template>
