import type { InjectionKey, Ref } from 'vue'
import type { CurrentUser } from '~/types/auth'

export const SETTING_ME_KEY: InjectionKey<Ref<CurrentUser>> = Symbol('setting-me')
