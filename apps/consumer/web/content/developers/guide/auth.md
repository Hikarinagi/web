---
section: auth
order: 1
title: 鉴权
description: 应用级与用户级两种令牌的取法、代表对象与可用 scope。
---

| 令牌   | 取法                        | 代表           | scope                                                     |
| ------ | --------------------------- | -------------- | --------------------------------------------------------- |
| 应用级 | `client_credentials`        | 应用自己       | `catalog:read`、`catalog:full`                            |
| 用户级 | `authorization_code` + PKCE | 同意授权的用户 | `catalog:*`，外加 `user:read`、`status:*`、`collection:*` |

- 开放平台令牌仅可访问 `api.hikarinagi.org/v3/**`，用于其它接口将返回 401。
- 客户端类型在控制台切换。机密客户端持有 client_secret，可取得应用级令牌；公共客户端（SPA、移动端）不持有密钥，仅支持授权码流程。
- 授权码流程强制启用 PKCE，未携带 `code_challenge` 的授权请求将被拒绝。
