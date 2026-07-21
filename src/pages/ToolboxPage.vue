<script setup lang="ts">
import { usePageSeo } from '@/utils/seo'

usePageSeo('toolbox')

const downloads = {
  installer: '/downloads/dandan-note-0.1.0-x64-setup.exe',
  portable: '/downloads/dandan-note-0.1.0-x64-portable.exe',
}
</script>

<template>
  <div class="page page--app toolbox">
    <section class="toolbox-hero">
      <div class="toolbox-hero__copy">
        <p class="toolbox-hero__eyebrow">
          <span class="toolbox-hero__status" aria-hidden="true" />
          DANDAN LAB · 小而好用
        </p>
        <h1>蛋蛋工具箱</h1>
        <p>收纳我们认真做的小工具。轻量、克制，解决日常里那些具体的小麻烦。</p>
      </div>
      <div class="toolbox-hero__mark" aria-hidden="true">
        <span class="toolbox-hero__egg">D</span>
        <span class="toolbox-hero__orbit" />
      </div>
    </section>

    <section class="toolbox-section" aria-labelledby="desktop-tools">
      <div class="toolbox-section__head">
        <div>
          <p class="toolbox-section__index">01 / 桌面效率</p>
          <h2 id="desktop-tools">现在可用</h2>
        </div>
        <span class="toolbox-section__count">1 个工具</span>
      </div>

      <article class="tool-card">
        <div class="tool-card__preview" aria-hidden="true">
          <div class="note-window">
            <div class="note-window__bar">
              <span /><span /><span />
            </div>
            <div class="note-window__body">
              <div class="note-window__side">
                <i /><i /><i />
              </div>
              <div class="note-window__notes">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
          <span class="tool-card__float tool-card__float--pin">置顶</span>
          <span class="tool-card__float tool-card__float--local">本地</span>
        </div>

        <div class="tool-card__content">
          <div class="tool-card__meta">
            <span class="tool-card__icon" aria-hidden="true">蛋</span>
            <div>
              <h3>蛋蛋便签</h3>
              <p>Windows 桌面便签与待办</p>
            </div>
            <span class="tool-card__version">v0.1.0</span>
          </div>

          <p class="tool-card__intro">
            把今天要记住的事，安静地留在桌面上。支持笔记与待办、日期筛选、标签分类和透明度调整，数据只保存在你的电脑里。
          </p>

          <ul class="tool-card__features" aria-label="蛋蛋便签功能">
            <li><span aria-hidden="true">✓</span> 桌面常驻与窗口置顶</li>
            <li><span aria-hidden="true">✓</span> 笔记、待办自由切换</li>
            <li><span aria-hidden="true">✓</span> SQLite 本地保存</li>
            <li><span aria-hidden="true">✓</span> 开机启动与透明度设置</li>
          </ul>

          <div class="tool-card__downloads">
            <a class="download download--primary" :href="downloads.installer" download>
              <span class="download__symbol" aria-hidden="true">↓</span>
              <span>
                <strong>下载安装包</strong>
                <small>Windows 10 / 11 · x64</small>
              </span>
            </a>
            <a class="download download--secondary" :href="downloads.portable" download>
              <span class="download__symbol" aria-hidden="true">↗</span>
              <span>
                <strong>便携版 EXE</strong>
                <small>无需安装，直接运行</small>
              </span>
            </a>
          </div>

          <p class="tool-card__notice">
            首次运行若出现 Windows 安全提示，请选择“更多信息”后继续运行。
          </p>
        </div>
      </article>
    </section>

    <section class="toolbox-coming" aria-label="更多工具">
      <span class="toolbox-coming__line" />
      <p>更多小工具，正在慢慢孵化</p>
      <span class="toolbox-coming__eggs" aria-hidden="true">○ · ○ · ○</span>
    </section>
  </div>
</template>

<style scoped lang="scss">
.toolbox {
  max-width: $pindou-content-wide;
  margin: 0 auto;
  padding-bottom: 64px;
}

.toolbox-hero {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 230px;
  padding: clamp(28px, 6vw, 54px);
  overflow: hidden;
  border: 1px solid rgba($pindou-primary, 0.18);
  border-radius: 26px;
  background:
    linear-gradient(110deg, rgba(#fff, 0.96), rgba($pindou-primary-light, 0.82)),
    $pindou-bg-card;
  box-shadow: $pindou-shadow-md;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.35;
    background-image: radial-gradient(rgba($pindou-primary, 0.22) 1px, transparent 1px);
    background-size: 18px 18px;
    mask-image: linear-gradient(90deg, transparent, #000);
  }
}

.toolbox-hero__copy {
  position: relative;
  z-index: 1;
  max-width: 580px;

  h1 {
    margin: 10px 0 12px;
    font-family: $pindou-font-display;
    font-size: clamp(34px, 7vw, 56px);
    line-height: 1;
    letter-spacing: -0.045em;
  }

  > p:last-child {
    max-width: 480px;
    margin: 0;
    color: $pindou-text-secondary;
    font-size: clamp(14px, 2vw, 16px);
    line-height: 1.75;
  }
}

.toolbox-hero__eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: $pindou-primary;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.15em;
}

.toolbox-hero__status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: $pindou-accent;
  box-shadow: 0 0 0 5px rgba($pindou-accent, 0.12);
}

.toolbox-hero__mark {
  position: relative;
  z-index: 1;
  display: none;
  flex: 0 0 150px;
  height: 150px;
  align-items: center;
  justify-content: center;
}

.toolbox-hero__egg {
  display: grid;
  width: 84px;
  height: 104px;
  place-items: center;
  border-radius: 50% 50% 46% 46% / 58% 58% 42% 42%;
  background: linear-gradient(145deg, #fff 20%, #e8eaf8);
  color: $pindou-primary;
  font-family: $pindou-font-display;
  font-size: 38px;
  font-weight: 800;
  box-shadow: 0 18px 42px rgba($pindou-primary, 0.2), inset -8px -10px 20px rgba($pindou-primary, 0.08);
  transform: rotate(7deg);
}

.toolbox-hero__orbit {
  position: absolute;
  inset: 4px;
  border: 1px dashed rgba($pindou-primary, 0.28);
  border-radius: 50%;
  animation: toolbox-spin 18s linear infinite;

  &::after {
    content: '';
    position: absolute;
    top: 16px;
    right: 14px;
    width: 12px;
    height: 12px;
    border-radius: 4px;
    background: $pindou-accent;
    transform: rotate(18deg);
  }
}

.toolbox-section {
  margin-top: 40px;
}

.toolbox-section__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  padding: 0 4px;

  h2 {
    margin: 4px 0 0;
    font-family: $pindou-font-display;
    font-size: 24px;
    letter-spacing: -0.02em;
  }
}

.toolbox-section__index {
  margin: 0;
  color: $pindou-accent;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.13em;
}

.toolbox-section__count {
  color: $pindou-text-muted;
  font-size: $pindou-font-xs;
}

.tool-card {
  display: grid;
  overflow: hidden;
  border: 1px solid $pindou-border;
  border-radius: 22px;
  background: $pindou-bg-card;
  box-shadow: $pindou-shadow-md;
}

.tool-card__preview {
  position: relative;
  display: grid;
  min-height: 260px;
  place-items: center;
  overflow: hidden;
  background:
    radial-gradient(circle at 20% 20%, rgba($pindou-accent, 0.18), transparent 32%),
    linear-gradient(145deg, #242a45, #3f4d7a);

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.12;
    background-image:
      linear-gradient(#fff 1px, transparent 1px),
      linear-gradient(90deg, #fff 1px, transparent 1px);
    background-size: 24px 24px;
  }
}

.note-window {
  position: relative;
  z-index: 1;
  width: min(78%, 300px);
  overflow: hidden;
  border: 1px solid rgba(#fff, 0.6);
  border-radius: 14px;
  background: rgba(#fff, 0.9);
  box-shadow: 0 24px 50px rgba(#101426, 0.35);
  transform: rotate(-2deg);
}

.note-window__bar {
  display: flex;
  gap: 5px;
  padding: 10px 12px;
  border-bottom: 1px solid rgba($pindou-text, 0.08);

  span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: $pindou-bg-muted;

    &:first-child {
      background: $pindou-accent;
    }
  }
}

.note-window__body {
  display: flex;
  height: 142px;
}

.note-window__side {
  width: 31%;
  padding: 18px 14px;
  background: rgba($pindou-primary-light, 0.74);

  i {
    display: block;
    height: 7px;
    margin-bottom: 14px;
    border-radius: 5px;
    background: rgba($pindou-primary, 0.18);

    &:first-child {
      background: rgba($pindou-primary, 0.58);
    }
  }
}

.note-window__notes {
  flex: 1;
  padding: 20px;

  span {
    display: block;
    width: 88%;
    height: 8px;
    margin-bottom: 15px;
    border-radius: 5px;
    background: rgba($pindou-text, 0.11);

    &:first-child {
      width: 55%;
      height: 11px;
      background: rgba($pindou-text, 0.72);
    }

    &:last-child {
      width: 66%;
    }
  }
}

.tool-card__float {
  position: absolute;
  z-index: 2;
  padding: 6px 10px;
  border: 1px solid rgba(#fff, 0.55);
  border-radius: $pindou-radius-pill;
  background: rgba(#fff, 0.88);
  color: $pindou-text-secondary;
  font-size: 10px;
  font-weight: 700;
  box-shadow: $pindou-shadow-sm;
  backdrop-filter: blur(8px);
}

.tool-card__float--pin {
  top: 18%;
  right: 8%;
  transform: rotate(6deg);
}

.tool-card__float--local {
  bottom: 16%;
  left: 7%;
  transform: rotate(-5deg);
}

.tool-card__content {
  padding: clamp(22px, 5vw, 38px);
}

.tool-card__meta {
  display: flex;
  align-items: center;
  gap: 12px;

  h3 {
    margin: 0;
    font-family: $pindou-font-display;
    font-size: 24px;
    line-height: 1.2;
  }

  p {
    margin: 3px 0 0;
    color: $pindou-text-muted;
    font-size: $pindou-font-xs;
  }
}

.tool-card__icon {
  display: grid;
  flex: 0 0 44px;
  height: 44px;
  place-items: center;
  border-radius: 13px;
  background: linear-gradient(145deg, $pindou-primary, $pindou-primary-dark);
  color: #fff;
  font-family: $pindou-font-display;
  font-size: 16px;
  font-weight: 800;
  box-shadow: 0 6px 16px rgba($pindou-primary, 0.25);
}

.tool-card__version {
  align-self: flex-start;
  margin-left: auto;
  padding: 4px 8px;
  border-radius: $pindou-radius-pill;
  background: $pindou-bg-subtle;
  color: $pindou-text-muted;
  font-size: 10px;
  font-weight: 700;
}

.tool-card__intro {
  margin: 20px 0 0;
  color: $pindou-text-secondary;
  font-size: $pindou-font-sm;
  line-height: 1.8;
}

.tool-card__features {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin: 20px 0 0;
  padding: 0;
  list-style: none;
  color: $pindou-text-secondary;
  font-size: $pindou-font-sm;

  span {
    margin-right: 6px;
    color: $pindou-success;
    font-weight: 800;
  }
}

.tool-card__downloads {
  display: grid;
  gap: 10px;
  margin-top: 24px;
}

.download {
  display: flex;
  align-items: center;
  gap: 11px;
  min-height: 58px;
  padding: 10px 14px;
  border-radius: 13px;
  text-decoration: none;
  transition: transform $pindou-duration-fast, box-shadow $pindou-duration-fast,
    border-color $pindou-duration-fast;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $pindou-shadow-md;
  }

  strong,
  small {
    display: block;
  }

  strong {
    font-size: $pindou-font-sm;
  }

  small {
    margin-top: 2px;
    opacity: 0.7;
    font-size: 10px;
  }
}

.download--primary {
  background: $pindou-primary;
  color: #fff;
  box-shadow: 0 5px 16px rgba($pindou-primary, 0.24);
}

.download--secondary {
  border: 1px solid $pindou-border;
  background: $pindou-bg-subtle;
  color: $pindou-text;
}

.download__symbol {
  display: grid;
  flex: 0 0 34px;
  height: 34px;
  place-items: center;
  border-radius: 10px;
  background: rgba(#fff, 0.16);
  font-size: 18px;

  .download--secondary & {
    background: $pindou-bg-muted;
    color: $pindou-primary;
  }
}

.tool-card__notice {
  margin: 12px 0 0;
  color: $pindou-text-hint;
  font-size: 10px;
  line-height: 1.5;
}

.toolbox-coming {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 34px;
  color: $pindou-text-muted;
  font-size: $pindou-font-xs;

  p {
    margin: 0;
    white-space: nowrap;
  }
}

.toolbox-coming__line {
  flex: 1;
  height: 1px;
  background: $pindou-border;
}

.toolbox-coming__eggs {
  color: rgba($pindou-primary, 0.45);
  letter-spacing: 0.2em;
}

@media (min-width: 620px) {
  .toolbox-hero__mark {
    display: flex;
  }

  .tool-card__features,
  .tool-card__downloads {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 860px) {
  .tool-card {
    grid-template-columns: minmax(320px, 0.9fr) minmax(0, 1.1fr);
  }

  .tool-card__preview {
    min-height: 100%;
  }
}

@keyframes toolbox-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .toolbox-hero__orbit {
    animation: none;
  }
}
</style>
