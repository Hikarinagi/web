const PLACEMENT =
  '类型应置于 *.types.ts 或模块的 contracts，常量应置于 *.constants.ts 或配置中心，Prisma 查询预设应置于 selects/，可复用的纯函数应置于 utils/。'

const TOP_LEVEL = kinds =>
  kinds.flatMap(kind => [
    `Program > ${kind}`,
    `Program > ExportNamedDeclaration > ${kind}`,
    `Program > ExportDefaultDeclaration > ${kind}`,
  ])

export const serviceFileRules = {
  files: ['**/*.service.ts'],
  ignores: ['**/*.spec.ts'],
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: TOP_LEVEL(['VariableDeclaration']).join(', '),
        message: `service 文件的顶层只能有 import 和一个导出的类，不能声明常量或变量。${PLACEMENT}`,
      },
      {
        selector: TOP_LEVEL(['FunctionDeclaration']).join(', '),
        message: `service 文件的顶层只能有 import 和一个导出的类，不能声明函数。${PLACEMENT}`,
      },
      {
        selector: TOP_LEVEL(['TSInterfaceDeclaration', 'TSTypeAliasDeclaration']).join(', '),
        message: `service 文件的顶层只能有 import 和一个导出的类，不能声明接口或类型。${PLACEMENT}`,
      },
      {
        selector: TOP_LEVEL(['TSEnumDeclaration', 'TSModuleDeclaration']).join(', '),
        message: `service 文件的顶层只能有 import 和一个导出的类，不能声明枚举或命名空间。${PLACEMENT}`,
      },
      {
        selector: 'Program > ClassDeclaration',
        message: 'service 文件中唯一的类必须导出；其他类应移至各自的文件。',
      },
      {
        selector:
          'Program > ExportNamedDeclaration:has(> ClassDeclaration) ~ ExportNamedDeclaration:has(> ClassDeclaration)',
        message: '一个 service 文件只能包含一个类；其他类应移至各自的文件。',
      },
      {
        selector: 'Program > ExportNamedDeclaration[source], Program > ExportAllDeclaration',
        message: 'service 文件不得转导出，调用方应直接从定义处导入。',
      },
    ],
  },
}
