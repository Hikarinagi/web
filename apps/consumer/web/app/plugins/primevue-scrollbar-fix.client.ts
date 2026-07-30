// PrimeVue 4 的 blockBodyScroll / unblockBodyScroll 没有 refcount,嵌套 modal
// (Dialog 里再开 ConfirmDialog)状态错乱:
//   - 第二次 blockBodyScroll 把 --p-scrollbar-width 算成 0 覆盖外层的值
//   - 第一次 unblockBodyScroll 直接 removeProperty + removeClass,把外层的锁拆了
// 4.5.5 未修。已知 issue: primefaces/primevue#6089 / #6094。
//
// 用 setProperty('--p-scrollbar-width') 作为 block 调用的特征,反向用
// removeProperty 作为 unblock 特征,在 body 这一层做一个 depth 计数,把
// 内层的 set/remove 都拦下,只有最外层那一对真改 DOM。
// addClass 那一侧 @primeuix 自带 hasClass 守护,第二次 add 本就是 no-op,不用动。
export default defineNuxtPlugin(() => {
  const VAR = '--p-scrollbar-width'
  const LOCK_CLASS = 'p-overflow-hidden'
  let depth = 0

  const protoSetProperty = CSSStyleDeclaration.prototype.setProperty
  CSSStyleDeclaration.prototype.setProperty = function (name, value, priority) {
    if (this === document.body.style && name === VAR) {
      depth += 1
      if (depth > 1) return
    }
    return protoSetProperty.call(this, name, value, priority)
  }

  const protoRemoveProperty = CSSStyleDeclaration.prototype.removeProperty
  CSSStyleDeclaration.prototype.removeProperty = function (name) {
    if (this === document.body.style && name === VAR) {
      if (depth > 0) depth -= 1
      if (depth > 0) return ''
    }
    return protoRemoveProperty.call(this, name)
  }

  const protoRemove = DOMTokenList.prototype.remove
  DOMTokenList.prototype.remove = function (...tokens) {
    if (this === document.body.classList && tokens.includes(LOCK_CLASS) && depth > 0) {
      const others = tokens.filter(token => token !== LOCK_CLASS)
      if (others.length) protoRemove.apply(this, others)
      return
    }
    return protoRemove.apply(this, tokens)
  }
})
