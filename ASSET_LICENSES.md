# 素材与第三方许可

- 本项目自有代码、文档及自行生成的概念图：MIT，见根目录 LICENSE；不覆盖第三方软件、字体或商标。
- `public/media/ai-multiverse-*` 是原项目于 2026-08-29 使用 OpenAI 图像生成制作的概念占位图。保留 PNG 原图、WebP、社交 JPG 与原始来源说明，不代表真实证书或个人摄影。
- `docs/images/open-worlds-*.png` 为本次本地静态构建的真实浏览器截图，画面中的履历仍是演示数据。
- `src/app/fonts/*.woff2` 来自原 Next/Google Fonts 构建使用的 Geist 与 Geist Mono 子集，按 SIL Open Font License 1.1 保存，完整版权与许可见同目录 OFL.txt。[Geist 官方来源](https://github.com/vercel/geist-font)、[Google Fonts Geist](https://github.com/google/fonts/tree/main/ofl/geist)、[Geist Mono](https://github.com/google/fonts/tree/main/ofl/geistmono)。
- npm 生产依赖的完整版权与许可声明见 `public/assets/licenses/THIRD_PARTY_NOTICES.md`，使用 `npm run licenses:generate` 重新生成。
- GSAP 3.15 与 @gsap/react 使用 GSAP Standard License 等上游条款，不是 MIT/OSI 许可。使用前阅读归档声明与 [GSAP 官方许可](https://gsap.com/community/standard-license/)，根 MIT 不会替换第三方许可。
- 未纳入私人照片、真实证书、简历附件、账号配置、环境变量或原工程缓存。


## Linux native image-processing dependency

`@img/sharp-libvips-linux-x64@1.3.3` declares LGPL-3.0-or-later and bundles components under the terms listed by its upstream. Its real package README, component versions, complete LGPL/GPL/MPL texts, libvips copyright and exact source provenance are preserved in `public/assets/licenses/upstream/sharp-libvips-1.3.3/`. Packaging scripts use Apache-2.0; that does not replace the native libraries’ licenses. No native binary is added to this repository or static Pages artifact. The collector verifies package identity and versions before using this bundle; unknown/mismatched native versions remain a publication error. Existing GSAP restrictions remain in force.
