import { resolve } from 'node:path'

const CJK = /[　-ヿ㐀-鿿＀-￯]/

const MESSAGE = '面向用户的文案应放进语言包、按键名读取，代码里不要写中文或日文字面量。'

const TEMPLATE_MESSAGE =
  '站内信模板只在后端渲染，客户端只显示接口下发的文字，不能引用模板或 ICU 渲染库。'

const RENDERER_PACKAGES = [
  '@hikarinagi/shared/notification',
  'intl-messageformat',
  '@formatjs/icu-messageformat-parser',
]

const noCjkLiteral = {
  meta: {
    type: 'problem',
    messages: { literal: MESSAGE },
    schema: [
      {
        type: 'object',
        properties: {
          allow: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                file: { type: 'string' },
                literals: { type: 'array', items: { type: 'string' } },
              },
              required: ['file', 'literals'],
              additionalProperties: false,
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const file = context.physicalFilename ?? context.filename
    const entry = (context.options[0]?.allow ?? []).find(item => item.file === file)
    const allowed = new Set(entry?.literals ?? [])
    const check = (node, text, value = text) => {
      if (CJK.test(text) && !allowed.has(value)) context.report({ node, messageId: 'literal' })
    }
    const script = {
      Literal(node) {
        if (typeof node.value === 'string') check(node, node.value)
      },
      TemplateElement(node) {
        check(node, node.value.cooked ?? node.value.raw, node.value.raw)
      },
      JSXText(node) {
        check(node, node.value)
      },
    }
    const services = context.sourceCode.parserServices
    if (!services?.defineTemplateBodyVisitor) return script
    return services.defineTemplateBodyVisitor(
      {
        ...script,
        VText(node) {
          check(node, node.value, node.value.trim())
        },
        VLiteral(node) {
          check(node, node.value)
        },
      },
      script,
    )
  },
}

const noNotificationTemplate = {
  meta: {
    type: 'problem',
    messages: { template: TEMPLATE_MESSAGE },
    schema: [],
  },
  create(context) {
    const check = node => {
      const source =
        node?.type === 'TemplateLiteral' && node.expressions.length === 0
          ? node.quasis[0].value.cooked
          : node?.value
      if (typeof source !== 'string') return
      if (RENDERER_PACKAGES.some(name => source === name || source.startsWith(`${name}/`))) {
        context.report({ node, messageId: 'template' })
      }
    }
    return {
      ImportDeclaration: node => check(node.source),
      ExportNamedDeclaration: node => check(node.source),
      ExportAllDeclaration: node => check(node.source),
      ImportExpression: node => check(node.source),
      TSImportType: node => check(node.argument?.literal ?? node.argument),
      TSImportEqualsDeclaration(node) {
        if (node.moduleReference.type === 'TSExternalModuleReference') {
          check(node.moduleReference.expression)
        }
      },
      CallExpression(node) {
        if (node.callee.type === 'Identifier' && node.callee.name === 'require') {
          check(node.arguments[0])
        }
      },
    }
  },
}

export const hikariI18nPlugin = {
  rules: { 'no-cjk-literal': noCjkLiteral, 'no-notification-template': noNotificationTemplate },
}

export function noCjkLiterals({ files, ignores = [], thirdParty = [], root }) {
  const incomplete = thirdParty.filter(
    entry => !entry.source?.trim() || !Array.isArray(entry.literals) || !entry.literals.length,
  )
  if (incomplete.length) {
    throw new Error(
      `i18n-third-party.json 的每一条都要用 source 写明外部来源，并用 literals 列出放行的字面量：${incomplete.map(entry => entry.file).join(', ')}`,
    )
  }
  if (thirdParty.length && !root) {
    throw new Error('传入 thirdParty 时要同时传入 root（配置文件所在目录），用来解析名单里的路径。')
  }
  const allow = thirdParty.map(entry => ({
    file: resolve(root, entry.file),
    literals: entry.literals,
  }))
  return {
    files,
    ignores: ['**/*.prompt.ts', ...ignores],
    plugins: { 'hikari-i18n': hikariI18nPlugin },
    rules: { 'hikari-i18n/no-cjk-literal': ['error', { allow }] },
  }
}

export function noNotificationTemplates({ files }) {
  return {
    files,
    plugins: { 'hikari-i18n': hikariI18nPlugin },
    rules: { 'hikari-i18n/no-notification-template': 'error' },
  }
}

export function noRawI18n({ files, ignores = [], hint }) {
  return {
    files,
    ignores,
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: "CallExpression[callee.name='useI18n']", message: hint },
        { selector: "MemberExpression[property.name='$i18n']", message: hint },
        { selector: "MemberExpression[property.value='$i18n']", message: hint },
        { selector: "ObjectPattern > Property[key.name='$i18n']", message: hint },
        { selector: "ObjectPattern > Property[key.value='$i18n']", message: hint },
      ],
      'vue/no-restricted-syntax': [
        'error',
        { selector: 'Identifier[name=/^\\$(t|te|tm|rt|d|n|i18n)$/]', message: hint },
      ],
    },
  }
}
