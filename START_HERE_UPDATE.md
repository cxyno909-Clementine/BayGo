# BayGo：这次如何更新

这是2026年11月15日四批修改加跨城交通指南的合并版。只需要使用这一包，不必再分别上传之前的小包。原始 BayGo 3 文件夹没有被改动。

## 上传到现有仓库

1. 解压 BayGo_Complete_Update_2026-11-15.zip。
2. 打开已有仓库：https://github.com/cxyno909-Clementine/BayGo 。
3. 在 Code 页面选择 Add file → Upload files。
4. 把解压后里面的文件和文件夹一起拖入上传区，包括 assets。不要上传 ZIP 本身，也不要只上传包住所有文件的外层文件夹。
5. 确认仓库最外层可以直接看到 index.html、app.js、community.js、permits.js、travel-guides.js、prices.js 等文件，以及 assets 文件夹。选择 Commit changes，提交到 main。
6. 到 Actions 查看部署任务，等待绿色成功标记。Pages 仍应为 main 和 /(root)，不需要另建仓库或修改域名。

同名文件会在提交中更新，本包不要求删除原文件。若页面提示上传未完成或有冲突，先处理后再提交。

## 打开网页检查

地址不变：https://cxyno909-clementine.github.io/BayGo/ 。部署成功后重新打开；如仍显示旧内容，在 Mac Chrome 中按 Command + Shift + R 强制刷新。

确认更新的方法：Community 能看到 Find or Create 和 Inbox；Life 能找到 Hong Kong & Macao Travel Permit and Tourist Endorsements。

本次追加：Life 中可见 Intercity Travel & Tickets。切换珠海、广州、深圳、香港和澳门后，可见与该城市相关的交通指南。指南列有购票入口和准备清单；售票在运营方网站或微信内完成，不在 BayGo 内出票。

发帖追加：Community → Student Stories → Write a Post 可创建带地点标签和餐品推荐的帖子。自选行程结果页、预设路线详情页和推荐路线详情页可点 Share Route to Student Stories，把路线带入草稿；补充内容、声明关联后，先预览再本地发布。Me → My Posts 可编辑或撤下。此追加必须同时上传 stories.js 和新版 app.js、index.html、styles.css。

## 五条验收路线

- 地点与规划：打开地点 → Add to My Plan → 按钮变为已添加 → 再选地点 → 查看路线；尝试中文地点搜索，确认选择不丢。
- 价格：查看有价格的餐饮和场馆详情；自选行程只显示已知费用小计，不把未知费用当免费。
- 生活指南：Life → 通行证指南 → 切换办理类型、户籍情形 → 勾选材料 → 刷新，检查选择与进度是否保留。
- 活动：Community → Find or Create → 选未来日期与条件 → 无合适结果时沿用内容发布；创建前完成模拟登录和验证。My Activities 可查看和取消。
- 申请与消息：申请样例活动 → My Applications → 展开 Demo controls 模拟接受或拒绝 → Inbox 保存本地消息。接受扣名额，撤回恢复；拒绝或撤回后会话只读。

## Presentation 前

已通过逻辑检查，仍需在真实浏览器检查手机宽度及以上流程。用当天设备关闭 VPN，在实际校园网络和手机流量下分别打开，检查图片、地图与官方外链。GitHub Pages 不保证每个大陆网络都稳定可达。

不要在演示前清除浏览器数据，以免丢失准备好的演示操作。确需重置时，Me → Clear saved data on this device 会清除本设备全部演示操作记录。

课堂表述：这是交互网页原型；认证、发布、申请和消息为本地演示。价格含历史参考和缺失项，实时路线未接通。

## 团队维护

团队需指定一名具体的内容维护人，接收组员汇总的过期信息，核实官方来源，再由代码维护人更新。当前 Report 仅保存本地，没有发给团队；正式运营前需接入真实反馈后台。
