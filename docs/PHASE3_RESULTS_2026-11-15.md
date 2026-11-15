# 第三批：社区活动、拼车与收件箱

本批完成本地实现和逻辑检查，未更新线上。真实跨用户发布、验证、申请和聊天仍需后端，本批全部操作仅保存在本设备浏览器。

## 已完成的使用流程

1. Community → Find or Create：选择城市、活动分类、日期、时间范围、目标总人数、已有同行人数（含本人）、性别偏好（默认 Any）、集合区域和补充说明。
2. 查找结果保留城市、分类、日期、重叠时间、集合区域关键词、目标总人数及性别偏好等条件，要求剩余名额容纳已有同行；拼车同时匹配出发地、目的地。不会因无结果擅自放宽条件，也不把备注描述声称为 AI 语义匹配。
3. 没有合适活动时，选择 Create Using These Details。之前输入自动保留，补标题、活动内容、费用分摊和本地演示确认，模拟校园验证后发布。
4. 发布后可查看详情，并在 My Activities 管理、取消；不能申请自己的活动。重复提交同一已完成表单不会重复发布。
5. 对样例活动申请，可填写本次申请人数及留言；申请状态为 Pending。申请人数不超过剩余名额。提交时不预占名额。
6. 在 My Applications 展开明确标示的 Demo controls，手动模拟主办人接受或拒绝。接受才扣减相应名额；撤回 Pending 或 Accepted 申请后恢复可用名额。不会自动伪造主办人决定。
7. Community 和 Me 均有 Inbox 入口，申请记录、活动详情也可进入对应会话。保存的消息标为 You · local only，系统变更产生本地未读提示；打开会话后清除未读。
8. 拒绝或撤回申请后会话只读；活动结束或取消后也不能再添加消息。历史记录保留。不会自动生成主办人回复。

## 分类和拼车

活动分类统一为 Dining、Hiking & Walks、Events、Sports、Sightseeing、Carpool。筛选、创建与匹配使用相同分类；原 Outing 样例按 Sightseeing 兼容。新增5个明确标示的虚构样例，用于展示各分类的工作流程。

拼车额外包含：出发地、目的地、出发时间范围、人数、交通安排、车辆或预订是否已安排、费用分摊。空位由总人数减已有参与人数计算。此演示限制为2–7人，仍需实际确认车辆容量；不提供叫车、付款或司机核验。

## 数据与状态约定

| 数据 | 本地字段 / 规则 |
|---|---|
| 活动 | activity_id、city、category、starts_local、ends_local、capacity、accepted、remaining、gender、meeting_detail_en、description_en、cost_split_en |
| 本人发布 | state.localActivities；authenticity=LOCAL，不随样例滚动日期 |
| 搜索 / 创建草稿 | state.communityDraft；保留输入，切换表单或认证后可继续 |
| 申请 | state.applications[activity_id]；Pending → Accepted / Declined / Withdrawn；Accepted → Withdrawn |
| 申请人数 | partySize；接受后按此人数扣减演示名额 |
| 申请对应日期 | scheduledStart / scheduledEnd；锁定申请时的样例日期，避免活动过期后悄悄滚动到下一周 |
| 本地会话 | state.communityThreads[activity_id]；messages 含 role、text、at；未读为 unread |
| 消息权限 | 已模拟验证，申请为 Pending 或 Accepted，且活动没有取消或结束 |
| 旧版本兼容 | 旧申请缺会话时，生成明确标示的本地恢复提示，不生成主办人回复 |

现阶段剩余名额由本地状态计算，没有跨用户并发约束。正式后台需要校验真实身份、参与权限和状态变化，原子处理名额，并把本地系统更新替换为真实事件。不能直接将当前前端模拟视为可靠的名额预订或消息送达服务。

## 验证结果

scripts/verify-community.mjs 已通过：严格匹配和无匹配、日期与人数校验、拼车出发地/目的地、草稿沿用、认证返回、发布和重复提交、禁止申请本人活动、多人申请、未读清除、本地消息、接受/拒绝/撤回、人数恢复、刷新保留、取消时保存失败回滚、旧申请迁移及9种新增/关联页面生成。

同时通过第一批功能回归和价格检查。以上是带 DOM 替身的逻辑/HTML 检查，尚未完成真实浏览器布局与线上验收。

## 修改文件

- 新增 community.js 和 scripts/verify-community.mjs。
- 更新 app.js、index.html、styles.css、scripts/verify-phase1.mjs 及执行计划。
- 未改动原始 BayGo 3 文件夹；尚未发布。

## 后续

按原需求，最后补港澳通行证指南，再做整体验收和统一发布包。用户目前无需逐批上传。
