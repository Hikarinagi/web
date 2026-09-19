---
section: scopes
order: 4
title: 权限范围
description: 全部 scope 的含义、取得方式与两组蕴含关系。
---

应用可申请的 scope 在控制台勾选，换取令牌时请求的 scope 不得超出该集合。标注「需用户授权」的 scope 仅可通过授权码流程取得；即使已在控制台勾选，客户端凭据流程签发的令牌也不会包含它们。其余 scope 两种流程都可取得，授权码流程签发的令牌同样可以携带 catalog scope 去调用条目端点。

::guide-scopes
::

存在两组蕴含关系：`catalog:full` 包含 `catalog:read`，`status:write` 包含 `status:read`。申请上位 scope 即可，无需重复勾选。
