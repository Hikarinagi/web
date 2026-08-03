<script setup lang="ts">
  defineOptions({ name: 'DeveloperLandingFlow' })

  const SOURCE = `flowchart LR
    A([创建应用]):::start --> B[勾选 catalog scope]:::app
    B --> C[换取应用级令牌]:::app --> D[调用 open 端点]:::app
    A --> E[配置回调地址与用户级 scope]:::user
    E --> F[引导用户授权]:::user --> G[用 code 换取用户级令牌]:::user --> H[代表用户读写]:::user`

  const ALT =
    '接入流程：创建应用后有两条可并行的路径。读取公开数据勾选 catalog scope，换取应用级令牌即可调用 open 端点；读写用户数据需先配置回调地址与用户级 scope，引导用户授权，用回调返回的 code 换取用户级令牌，再代表用户读写。用户级令牌同样可以携带 catalog scope，一个令牌即可覆盖两条路径。'
</script>

<template>
  <MermaidDiagram :source="SOURCE" :alt="ALT" />
</template>
