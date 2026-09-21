---
section: app-flow
order: 2
title: 应用级令牌
description: 用客户端凭据换取代表应用自身的令牌，调用公开的条目端点。
---

在[控制台](/developers/console)创建应用并勾选 `catalog:read`，随后使用密钥换取令牌。请求的 scope 不得超出应用已获授权的范围，否则返回 `invalid_scope`。

::guide-snippet{name="app_token"}
::

::guide-snippet{name="app_call"}
::

访问令牌有效期为 1 小时，过期后重新换取。应用级令牌不签发 refresh token。
