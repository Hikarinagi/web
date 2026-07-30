import { defineStore } from 'pinia'

export const useEmojiManageStore = defineStore('emoji-manage', () => {
  const open = ref(false)

  function show() {
    open.value = true
  }
  function close() {
    open.value = false
  }

  return { open, show, close }
})
