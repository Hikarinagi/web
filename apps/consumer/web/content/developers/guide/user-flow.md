---
section: user-flow
order: 3
title: 用户级令牌
description: 授权码 + PKCE 流程，取得代表授权用户的令牌。
---

Hikarinagi ID 通过 OpenID Connect 授权码流程签发用户级令牌，PKCE 为必填项。应用须先在控制台配置回调地址，配置后方可开通授权码流程并勾选用户级 scope。

## 使用标准客户端库

Hikarinagi ID 为标准 OpenID Connect 实现，未引入私有扩展。向客户端库提供下列发现文档地址，端点、支持的 scope 与签名密钥即可自动获取。

::guide-value{field="discovery_endpoint" block}
::

| 平台          | 客户端库         |
| ------------- | ---------------- |
| 服务端 Node   | `openid-client`  |
| 浏览器 SPA    | `oidc-client-ts` |
| iOS / Android | `AppAuth`        |
| Go            | `coreos/go-oidc` |

以下为该流程的原始 HTTP 交互，供自行实现或排查时参照。

## 1. 生成 PKCE 参数

Hikarinagi ID 仅接受 `S256`，不接受 `plain`。

::guide-snippet{name="pkce"}
::

## 2. 发起授权请求

由浏览器导航至授权端点。

::guide-snippet{name="authorize"}
::

| 参数                    | 要求                         | 说明                                                                                                                                                              |
| ----------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `response_type`         | 必填                         | 固定为 `code`，不支持隐式流                                                                                                                                       |
| `client_id`             | 必填                         | 控制台中该应用的 client_id                                                                                                                                        |
| `redirect_uri`          | 必填                         | 必须与控制台登记的某一条完全一致，包括协议、端口、路径与结尾斜杠，不做前缀匹配                                                                                    |
| `scope`                 | 必填                         | 空格分隔。`openid` 表示同时签发 ID token；`offline_access` 需与 `prompt=consent` 同时出现才会签发 refresh token；其余见「权限范围」，且不得超出控制台已勾选的集合 |
| `prompt`                | 申请 `offline_access` 时必填 | 取 `consent`。按 OIDC 规范，`prompt` 不含 `consent` 时 `offline_access` 会被静默忽略，授权仍然成功但不会签发 refresh token                                        |
| `state`                 | 必填                         | 随机值，回调时原样返回，须逐字比对后再继续                                                                                                                        |
| `nonce`                 | 申请 `openid` 时建议         | 随机值，原样写入所签发 ID token 的 nonce 声明                                                                                                                     |
| `code_challenge`        | 必填                         | code_verifier 的 SHA-256 摘要，base64url 编码                                                                                                                     |
| `code_challenge_method` | 必填                         | 固定为 `S256`，不接受 `plain`                                                                                                                                     |

## 3. 接收授权响应

用户在同意屏作出决策后，Hikarinagi ID 将响应参数附于 `redirect_uri` 的查询串返回。

| 参数                | 要求           | 说明                                                                             |
| ------------------- | -------------- | -------------------------------------------------------------------------------- |
| `code`              | 成功时返回     | 授权码，仅可使用一次，有效期 60 秒                                               |
| `state`             | 总是返回       | 原样回传授权请求中发出的值                                                       |
| `error`             | 失败时返回     | `access_denied` 表示用户拒绝授权；`invalid_scope` 表示申请了应用未获授权的 scope |
| `error_description` | 失败时可能返回 | 可读的失败原因，仅供排错                                                         |

## 4. 发起令牌请求

客户端认证方式须与控制台登记值一致，其余方式将被拒绝。机密客户端默认为 `client_secret_basic`：

::guide-snippet{name="basic_exchange"}
::

登记为 `client_secret_post` 时，凭据改由表单参数传递：

::guide-snippet{name="post_exchange"}
::

公共客户端不持有密钥，仅传递 client_id：

::guide-snippet{name="public_exchange"}
::

| 参数            | 要求           | 说明                                                   |
| --------------- | -------------- | ------------------------------------------------------ |
| `grant_type`    | 必填           | 固定为 `authorization_code`                            |
| `code`          | 必填           | 回调中拿到的授权码                                     |
| `redirect_uri`  | 必填           | 必须与授权请求中使用的那一条完全一致，否则换取失败     |
| `code_verifier` | 必填           | 第一步生成的原始随机串，而非其摘要                     |
| `client_id`     | 公共客户端必填 | 机密客户端不在此处传递，改由所登记的客户端认证方式携带 |

::guide-snippet{name="token_response"}
::

## 5. 访问受保护资源

以 `Authorization: Bearer` 请求头携带访问令牌。相关端点统一位于 `/v3/user/me/**` 之下，主体由令牌的 `sub` 声明确定，不接受在请求中指定用户。

::guide-snippet{name="user_call"}
::
