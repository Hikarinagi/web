import type { InjectionKey } from 'vue'

// 编辑器侧 provide true,Container 据此让出 my-[0.8em] 给 NodeViewWrapper,
// 让 selected ring 紧贴卡片几何。display 侧无 provider,Container 默认带 margin。
export const ENTITY_CARD_IN_EDITOR_KEY: InjectionKey<boolean> = Symbol('entity-card-in-editor')
