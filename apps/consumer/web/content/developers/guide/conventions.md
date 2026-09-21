---
section: conventions
order: 6
title: 响应约定
description: 统一响应信封、错误码与限流规则。
---

所有响应均使用统一信封，业务数据位于 `data` 字段。端点参考中的响应示例展示的即为该字段的内容；204 响应没有响应体。

## 成功

::guide-snippet{name="success_envelope"}
::

## 分页

分页信息位于 `data.meta`，与 `items` 同级，而非信封顶层。

::guide-snippet{name="paged_envelope"}
::

## 失败

失败响应不含 `data`，改为 `error`；`code` 为稳定的业务错误码，可用于分支判断。

::guide-snippet{name="error_envelope"}
::

## 错误码

| 状态码 | code                       | 出现时机                                                                        |
| ------ | -------------------------- | ------------------------------------------------------------------------------- |
| 401    | `AUTH_UNAUTHENTICATED`     | 缺少 Authorization 请求头，或该端点要求令牌代表某个用户而所用令牌只代表应用自身 |
| 401    | `AUTH_TOKEN_INVALID`       | 令牌的签名、签发方或受众不匹配，或令牌已过期、已被撤销                          |
| 403    | `AUTH_FORBIDDEN`           | 令牌有效，但缺少该端点要求的 scope                                              |
| 403    | `USER_BANNED`              | 授权用户的账号已被封禁或停用                                                    |
| 404    | `COMMON_NOT_FOUND`         | 资源不存在、未发布，或不在当前 scope 的可见范围内                               |
| 422    | `COMMON_VALIDATION_FAILED` | 请求体或查询参数未通过校验，`field_errors` 中给出逐字段原因                     |
| 429    | `COMMON_RATE_LIMITED`      | 超出该应用的调用频率上限                                                        |

## 限流

限流以应用为单位计数，默认 60 次 / 分钟，超出返回 429 `COMMON_RATE_LIMITED`。配额为应用级：同一应用代表不同用户发起的调用共享同一配额，批量同步场景需自行控制并发与节奏。

每个响应均携带以下响应头，描述的是该应用的配额而非来源 IP 的配额；四者均已列入 `Access-Control-Expose-Headers`，浏览器端应用可直接读取。请依据 `Retry-After` 退避，不要固定间隔重试。

| 响应头                  | 含义                                     |
| ----------------------- | ---------------------------------------- |
| `X-RateLimit-Limit`     | 当前窗口的调用上限，即该应用的配额       |
| `X-RateLimit-Remaining` | 当前窗口内剩余的调用次数，触发限流后为 0 |
| `X-RateLimit-Reset`     | 距当前窗口重置的秒数                     |
| `Retry-After`           | 仅 429 响应携带，恢复调用前需等待的秒数  |
