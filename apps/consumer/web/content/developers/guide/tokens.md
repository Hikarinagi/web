---
section: tokens
order: 5
title: 令牌生命周期
description: 令牌形态、受众、刷新与撤销。
---

服务发现文档位于 :guide-value{field="discovery_endpoint"}，可直接用于标准 OAuth / OIDC 客户端库的自动配置。

**访问令牌形态**：授权包含开放 API 权限时，签发自包含 JWT，无需调用内省端点即可验证；仅包含 `openid` / `profile` / `email` 时，签发不透明的身份令牌，用于调用用户信息端点。有效期均为 1 小时。

**受众**：开放 API 令牌的 `aud` 固定为 Hikarinagi ID 的 open 受众，仅 `api.hikarinagi.org/v3/**` 接受该受众；身份令牌不携带受众。

**用户信息端点**：服务发现文档中的 `userinfo_endpoint`。仅接受身份令牌；以绑定受众的 JWT 调用会返回 401，用户资料声明请读取 ID 令牌，或按下文换取身份令牌。

**刷新令牌**：仅在申请了 `offline_access` 的用户级授权中签发，且每次刷新均会轮换。请以响应中返回的新值覆盖原有 refresh token。

**撤销**：用户可在账号中心的「已授权应用」中随时取消授权，该应用名下的访问令牌与刷新令牌将立即失效。

## 刷新令牌

::guide-snippet{name="refresh"}
::

401 并不总是意味着令牌过期。用户撤销授权后刷新同样会失败，此时应引导用户重新完成授权流程，而非持续重试。

## 身份令牌与开放 API 令牌

同时申请了 `openid` 与开放 API 权限的应用，常规流程签发的是开放 API 令牌。如需调用用户信息端点，可在刷新时传入 `scope=openid`（可按需附加 `profile`、`email`）换取一枚身份令牌；轮换返回的新刷新令牌仍保留完整权限，后续照常刷新即可取回开放 API 令牌。
