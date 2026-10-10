import type { InjectionKey, Ref } from 'vue'
import type { CurrentUser } from '~/types/auth'

export const ME_KEY: InjectionKey<Ref<CurrentUser>> = Symbol('me')
