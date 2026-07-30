<script setup lang="ts">
  import { push } from 'notivue'

  function showSuccessToast() {
    push.success({
      title: '保存成功',
      message: 'Notivue 会跟随当前明暗主题。',
    })
  }

  function showInfoToast() {
    push.info({
      title: '提示',
      message: '这是 playground 中的普通通知示例。',
    })
  }

  function showErrorToast() {
    push.error({
      title: '请求失败',
      message: '用于检查错误通知在 dark theme 下的视觉效果。',
    })
  }

  function showPromiseToast() {
    const notification = push.promise({
      title: '处理中',
      message: '模拟一个异步任务。',
    })

    window.setTimeout(() => {
      notification.resolve({
        title: '处理完成',
        message: 'Promise notification 已完成。',
      })
    }, 1400)
  }
</script>

<template>
  <section class="space-y-4">
    <h2 class="text-base font-semibold text-color">Notifications</h2>
    <div class="flex flex-wrap items-center gap-3">
      <Button label="Success" @click="showSuccessToast" />
      <Button label="Info" severity="secondary" @click="showInfoToast" />
      <Button label="Error" severity="danger" variant="outlined" @click="showErrorToast" />
      <Button label="Promise" severity="secondary" variant="outlined" @click="showPromiseToast" />
    </div>
  </section>
</template>
