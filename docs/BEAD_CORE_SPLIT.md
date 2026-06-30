# bead-core 独立仓库说明

`@wangdandan810012/bead-core` 已从本仓库拆出，单独维护：

- **npm**：<https://www.npmjs.com/package/@wangdandan810012/bead-core>
- **GitHub**：<https://github.com/whr810012/bead-core>

## 本仓库如何引用

```json
"@wangdandan810012/bead-core": "^0.1.0"
```

## 首次克隆 pindou-web 后

```bash
npm install
npm run build:packages
```

## 本地联调 bead-core（可选）

若需同时改 `bead-core` 与 `pindou-web`，可将依赖临时改回：

```json
"@wangdandan810012/bead-core": "file:../bead-core"
```

并在 `vite.config.ts` / `tsconfig.json` 中恢复 `@wangdandan810012/bead-core` → `../bead-core/src` 别名。

## 算法文档

见 [bead-core/docs/algorithms](https://github.com/whr810012/bead-core/tree/main/docs/algorithms)。
