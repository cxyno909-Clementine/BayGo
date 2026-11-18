# BayGo：2026-11-18 预算与路线修订版

## 这次修改了什么

- 自选行程有“每人整趟预算”：BNBU 去程、各站交通、回校、餐饮、饮品和门票逐项汇总。
- 可修改餐饮次数、预留额、停留时间、出发/返程时间及额外交通缓冲。
- 缺少价格或汇率时显示待确认，不把未知费用当免费；购物和可选项目另行处理。
- 已查询路线显示高德路网距离、预计时间、可用交通方式和查询日期。可以切换方式，并填写核实过的每人车费和整段时间。
- 补上返程段，跨城与跨境显示完整的去返程阶段说明。未核实班次、票价和过关耗时不填假数据。
- 清空 Return By 后刷新会保留空值。路线请求有并发上限、缓存、取消和单段重试。
- 原有 Life、搭子、发帖、路线分享和图片保留。irical
## 如何更新现有 GitHub 网页

1. 解压这次 `BayGo_Budget_Routing_Update_2026-11-18.zip`。
2. 打开 https://github.com/cxyno909-Clementine/BayGo → Code → Add file → Upload files。
3. 上传解压后**最外层的文件与文件夹**，使仓库根目录直接出现 `index.html`。不要上传 ZIP，也不要套一层新文件夹。
4. 本次必须一起更新 `app.js`、`index.html`、`styles.css`，以及新增的 `budget.js`、`route-client.js`、`trip-planning.js`、`routing-snapshot.js`。完整包还保留所有既有功能文件与 assets，适合整体覆盖。
5. 同路径同名文件会更新，不会新增重复内容。提交到 main，Pages 继续使用 main 和 /(root)。
6. Actions 成功后打开 https://cxyno909-clementine.github.io/BayGo/ ，按 Command + Shift + R 强制刷新。

## 演示怎么检查

Home → Browse Places → 选至少两个地点 → Build My Route。先查看整趟费用，再修改总预算、餐饮预留、交通方式或地点顺序，检查金额和时间是否更新。去程和返程均在 Every journey stage 中。

已保存查询结果不覆盖每一个自选组合；没有结果的段落会显示待确认并提供地图入口，不能宣称整趟预算或返程时间已经核实。港澳非零费用需要在 Currency conversion 中填汇率、日期及来源/假设。

## 实时查询还差什么

你提供的 Key 已通过地点搜索验证，只用于本次查询，没有安装到网站。GitHub Pages 不能运行高德后端。本包 `backend/` 已准备好可独立部署的服务，但**尚未部署，也尚未验证公网 CORS**。要持续实时更新，团队还需要后端托管账号、正式部署并授权把 Key 存入服务端 secret；具体步骤见 `backend/README.md`。

当前网页上传包后可使用的是带日期的已查询路线，不是实时导航。照片链接仍可能受源站和现场网络影响。Community 的登录、验证、发布和申请仍为当前浏览器内的原型演示。

本地逻辑检查、公网部署、浏览器视觉检查是不同事项；验收记录见 `docs/REVIEW_FIX_RESULTS_2026-11-18.md`。
