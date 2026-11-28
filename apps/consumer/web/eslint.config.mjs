// @ts-check
import { noCjkLiterals, noNotificationTemplates, noRawI18n } from '@hikarinagi/config/eslint/i18n'
import withNuxt from './.nuxt/eslint.config.mjs'
import baseline from './i18n-baseline.json' with { type: 'json' }
import thirdParty from './i18n-third-party.json' with { type: 'json' }

export default withNuxt(
  {
    rules: {
      'vue/html-self-closing': 'off',
      'vue/first-attribute-linebreak': 'off',
    },
  },
  noCjkLiterals({
    files: ['app/**/*.{ts,vue}', 'server/**/*.ts', 'shared/**/*.ts'],
    ignores: baseline,
    thirdParty,
    root: import.meta.dirname,
  }),
  noNotificationTemplates({ files: ['app/**/*.{ts,vue}', 'server/**/*.ts', 'shared/**/*.ts'] }),
  noRawI18n({
    files: ['app/**/*.{ts,vue}'],
    ignores: [
      'app/composables/useLocaleText.ts',
      'app/composables/useLocaleRoot.ts',
      'app/utils/i18n.ts',
    ],
    hint: '请用 useLocaleText()（组件内）或 translate()（组件外）按强类型键名取文案。',
  }),
  {
    files: ['app/**/*.{ts,vue}'],
    ignores: ['app/components/locale/Message.vue'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'vue-i18n',
              importNames: ['Translation', 'I18nT'],
              message: '句子里要嵌组件时用 <LocaleMessage>，它的 keypath 受键名类型约束。',
            },
          ],
        },
      ],
      'vue/no-restricted-html-elements': [
        'error',
        {
          element: ['i18n-t', 'I18nT', 'Translation'],
          message: '句子里要嵌组件时用 <LocaleMessage>，它的 keypath 受键名类型约束。',
        },
      ],
    },
  },
)
