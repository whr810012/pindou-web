<script setup lang="ts">
import { usePageSeo } from '@/utils/seo'

usePageSeo('hub')
</script>

<template>
  <div class="hub">
    <div class="hub__sky" aria-hidden="true">
      <span class="hub__cloud hub__cloud--one" />
      <span class="hub__cloud hub__cloud--two" />
      <span class="hub__star hub__star--one">✦</span>
      <span class="hub__star hub__star--two">✦</span>
      <span class="hub__star hub__star--three">·</span>
    </div>

    <header class="hub-header">
      <router-link class="hub-brand" to="/" aria-label="蛋蛋中心首页">
        <span class="hub-brand__egg" aria-hidden="true">
          <i /><i />
        </span>
        <span class="hub-brand__copy">
          <strong>蛋蛋中心</strong>
          <small>DANDAN HUB</small>
        </span>
      </router-link>
      <nav class="hub-nav" aria-label="产品导航">
        <a href="#products">全部产品</a>
        <router-link to="/pindou">拼豆工坊</router-link>
        <router-link to="/toolbox">工具箱</router-link>
        <a href="/watermark/">加水印</a>
      </nav>
    </header>

    <main>
      <section class="hub-hero">
        <div class="hub-hero__copy">
          <p class="hub-kicker">
            <span aria-hidden="true">●</span>
            WELCOME TO DANDAN HUB
          </p>
          <h1>
            一颗蛋蛋，
            <span>孵化好用的点子。</span>
          </h1>
          <p class="hub-hero__lead">
            这里是我们的产品中心。做轻巧、认真、能解决真实小麻烦的工具，让创作和日常都简单一点。
          </p>
          <a class="hub-hero__jump" href="#products">
            看看孵化了什么
            <span aria-hidden="true">↓</span>
          </a>
        </div>

        <div class="hub-universe" aria-hidden="true">
          <span class="hub-universe__orbit hub-universe__orbit--outer">
            <i class="hub-universe__satellite hub-universe__satellite--bead" />
          </span>
          <span class="hub-universe__orbit hub-universe__orbit--inner">
            <i class="hub-universe__satellite hub-universe__satellite--note">✓</i>
          </span>
          <div class="hub-universe__egg">
            <span class="hub-universe__shine" />
            <span class="hub-universe__face">
              <i /><i />
              <b />
            </span>
          </div>
          <span class="hub-universe__label hub-universe__label--ideas">好点子</span>
          <span class="hub-universe__label hub-universe__label--tools">小工具</span>
        </div>
      </section>

      <section id="products" class="hub-products" aria-labelledby="products-title">
        <div class="hub-section-head">
          <div>
            <p>PRODUCTS / 01</p>
            <h2 id="products-title">正在发光的产品</h2>
          </div>
          <span>3 个产品 · 持续孵化中</span>
        </div>

        <div class="hub-product-grid">
          <router-link class="product-card product-card--pindou" to="/pindou">
            <div class="product-card__top">
              <span class="product-card__number">01</span>
              <span class="product-card__state">
                <i aria-hidden="true" />
                网页即开即用
              </span>
            </div>

            <div class="pindou-art" aria-hidden="true">
              <span v-for="index in 36" :key="index" :class="`pindou-art__bead pindou-art__bead--${index}`" />
              <span class="pindou-art__cursor">✦</span>
            </div>

            <div class="product-card__body">
              <p class="product-card__category">ONLINE CREATIVE TOOL</p>
              <h3>Pindou <span>拼豆工坊</span></h3>
              <p>把照片变成带色号的拼豆图纸。从像素化、配色、精修到导出，在浏览器里完成整套创作流程。</p>
              <ul>
                <li>照片转拼豆</li>
                <li>多品牌色卡</li>
                <li>本地隐私处理</li>
              </ul>
              <span class="product-card__action">
                进入拼豆工坊
                <i aria-hidden="true">↗</i>
              </span>
            </div>
          </router-link>

          <router-link class="product-card product-card--toolbox" to="/toolbox">
            <div class="product-card__top">
              <span class="product-card__number">02</span>
              <span class="product-card__state">
                <i aria-hidden="true" />
                Windows 可用
              </span>
            </div>

            <div class="toolbox-art" aria-hidden="true">
              <span class="toolbox-art__egg">D</span>
              <div class="toolbox-art__window">
                <span class="toolbox-art__bar"><i /><i /><i /></span>
                <span class="toolbox-art__line toolbox-art__line--title" />
                <span class="toolbox-art__line" />
                <span class="toolbox-art__line toolbox-art__line--short" />
                <span class="toolbox-art__check">✓</span>
              </div>
              <span class="toolbox-art__tag toolbox-art__tag--top">置顶</span>
              <span class="toolbox-art__tag toolbox-art__tag--bottom">本地保存</span>
            </div>

            <div class="product-card__body">
              <p class="product-card__category">DESKTOP UTILITIES</p>
              <h3>蛋蛋工具箱</h3>
              <p>收纳认真做的小型桌面工具。首个成员“蛋蛋便签”，让笔记和待办安静地留在桌面上。</p>
              <ul>
                <li>桌面便签</li>
                <li>待办管理</li>
                <li>本地数据</li>
              </ul>
              <span class="product-card__action">
                打开工具箱
                <i aria-hidden="true">↗</i>
              </span>
            </div>
          </router-link>

          <a class="product-card product-card--watermark" href="/watermark/">
            <div class="product-card__top">
              <span class="product-card__number">03</span>
              <span class="product-card__state">
                <i aria-hidden="true" />
                网页本地处理
              </span>
            </div>

            <div class="watermark-art" aria-hidden="true">
              <span class="watermark-art__grid" />
              <span class="watermark-art__file">
                <i class="watermark-art__photo" />
                <b>DANDAN</b>
                <i class="watermark-art__scan" />
              </span>
              <span class="watermark-art__seal">W</span>
              <span class="watermark-art__tag">NO UPLOAD</span>
            </div>

            <div class="product-card__body">
              <p class="product-card__category">LOCAL MEDIA UTILITY</p>
              <h3>加水印 <span>Watermark</span></h3>
              <p>在浏览器本地为图片、PDF 与视频添加文字、Logo 或隐藏标记，也能检测本工具生成的隐藏水印。</p>
              <ul>
                <li>图片 / PDF / 视频</li>
                <li>可见与隐藏水印</li>
                <li>文件不上传</li>
              </ul>
              <span class="product-card__action">
                打开加水印
                <i aria-hidden="true">↗</i>
              </span>
            </div>
          </a>
        </div>
      </section>

      <section class="hub-principles" aria-label="产品原则">
        <p class="hub-principles__intro">我们想做这样的产品</p>
        <div class="hub-principles__list">
          <article>
            <span>01</span>
            <strong>小而具体</strong>
            <p>不堆功能，先把一个真实问题解决好。</p>
          </article>
          <article>
            <span>02</span>
            <strong>尊重数据</strong>
            <p>能在本地完成的处理，就尽量留在本地。</p>
          </article>
          <article>
            <span>03</span>
            <strong>好用也好看</strong>
            <p>工具不该冷冰冰，每次打开都可以心情好一点。</p>
          </article>
        </div>
      </section>
    </main>

    <footer class="hub-footer">
      <div>
        <span class="hub-footer__egg" aria-hidden="true" />
        <strong>蛋蛋中心</strong>
        <span>一个持续孵化中的产品中心</span>
      </div>
      <p>© Dandan Hub · dandanhub.vip</p>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.hub {
  --hub-ink: #202032;
  --hub-blue: #5969df;
  --hub-orange: #eb805e;
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  color: var(--hub-ink);
  background:
    radial-gradient(circle at 82% 13%, rgba(120, 136, 242, 0.2), transparent 24%),
    radial-gradient(circle at 9% 42%, rgba(241, 154, 108, 0.14), transparent 23%),
    linear-gradient(165deg, #fffaf2 0%, #f4f0e9 48%, #ebeefe 100%);
}

.hub__sky {
  position: absolute;
  inset: 0;
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.28;
    background-image: radial-gradient(rgba(60, 58, 80, 0.16) 0.7px, transparent 0.7px);
    background-size: 17px 17px;
    mask-image: linear-gradient(to bottom, #000 0%, transparent 75%);
  }
}

.hub__cloud {
  position: absolute;
  border-radius: 999px;
  background: rgba(#fff, 0.48);
  filter: blur(1px);

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    background: inherit;
  }
}

.hub__cloud--one {
  top: 210px;
  left: -70px;
  width: 210px;
  height: 54px;

  &::before {
    width: 80px;
    height: 80px;
    left: 40px;
    bottom: 0;
  }

  &::after {
    width: 54px;
    height: 54px;
    left: 108px;
    bottom: 0;
  }
}

.hub__cloud--two {
  top: 90px;
  right: -46px;
  width: 150px;
  height: 42px;

  &::before {
    width: 66px;
    height: 66px;
    left: 30px;
    bottom: 0;
  }

  &::after {
    width: 44px;
    height: 44px;
    left: 83px;
    bottom: 0;
  }
}

.hub__star {
  position: absolute;
  color: var(--hub-orange);
  animation: star-twinkle 2.6s ease-in-out infinite;
}

.hub__star--one {
  top: 155px;
  left: 7%;
  font-size: 18px;
}

.hub__star--two {
  top: 39%;
  right: 7%;
  color: var(--hub-blue);
  font-size: 14px;
  animation-delay: 0.8s;
}

.hub__star--three {
  top: 25%;
  left: 48%;
  color: var(--hub-blue);
  font-size: 28px;
  animation-delay: 1.3s;
}

.hub-header {
  position: relative;
  z-index: 10;
  display: flex;
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: 18px 0;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.hub-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: inherit;
  text-decoration: none;
}

.hub-brand__egg {
  position: relative;
  width: 42px;
  height: 48px;
  border: 1px solid rgba(82, 91, 168, 0.18);
  border-radius: 50% 50% 46% 46% / 58% 58% 42% 42%;
  background: linear-gradient(145deg, #fff, #e9ecff);
  box-shadow: 0 5px 14px rgba(69, 76, 135, 0.12);
  transform: rotate(-5deg);

  i {
    position: absolute;
    top: 21px;
    width: 4px;
    height: 5px;
    border-radius: 50%;
    background: var(--hub-ink);

    &:first-child {
      left: 14px;
    }

    &:last-child {
      right: 13px;
    }
  }
}

.hub-brand__copy {
  display: flex;
  flex-direction: column;
  line-height: 1.05;

  strong {
    font-family: $pindou-font-display;
    font-size: 17px;
    letter-spacing: -0.02em;
  }

  small {
    margin-top: 5px;
    color: $pindou-text-muted;
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 0.19em;
  }
}

.hub-nav {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 4px;
  border: 1px solid rgba(91, 94, 125, 0.1);
  border-radius: 999px;
  background: rgba(#fff, 0.56);
  box-shadow: 0 5px 20px rgba(52, 50, 67, 0.05);
  backdrop-filter: blur(12px);

  a {
    padding: 7px 11px;
    border-radius: 999px;
    color: $pindou-text-secondary;
    font-size: 11px;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.18s ease, background 0.18s ease;

    &:hover {
      color: var(--hub-blue);
      background: #fff;
    }
  }
}

.hub main,
.hub-footer {
  position: relative;
  z-index: 1;
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
}

.hub-hero {
  display: grid;
  min-height: 570px;
  align-items: center;
  gap: 30px;
  padding: 48px 0 72px;
}

.hub-hero__copy {
  position: relative;
  z-index: 2;
  max-width: 650px;

  h1 {
    margin: 16px 0 22px;
    font-family: $pindou-font-display;
    font-size: clamp(43px, 11vw, 78px);
    font-weight: 800;
    line-height: 0.98;
    letter-spacing: -0.055em;

    span {
      display: block;
      margin-top: 9px;
      color: var(--hub-blue);
    }
  }
}

.hub-kicker {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0;
  color: var(--hub-orange);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.17em;

  span {
    font-size: 7px;
    box-shadow: 0 0 0 5px rgba(235, 128, 94, 0.12);
  }
}

.hub-hero__lead {
  max-width: 560px;
  margin: 0;
  color: $pindou-text-secondary;
  font-size: clamp(15px, 2.6vw, 18px);
  line-height: 1.8;
}

.hub-hero__jump {
  display: inline-flex;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
  padding: 12px 18px;
  border: 1px solid rgba(73, 76, 112, 0.16);
  border-radius: 999px;
  background: rgba(#fff, 0.64);
  color: var(--hub-ink);
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 8px 28px rgba(61, 58, 73, 0.08);
  backdrop-filter: blur(8px);

  span {
    color: var(--hub-orange);
    font-size: 16px;
  }
}

.hub-universe {
  position: relative;
  width: min(78vw, 390px);
  height: min(78vw, 390px);
  margin: 0 auto;
}

.hub-universe__orbit {
  position: absolute;
  border: 1px dashed rgba(83, 91, 174, 0.28);
  border-radius: 50%;
  animation: universe-spin 22s linear infinite;
}

.hub-universe__orbit--outer {
  inset: 0;
}

.hub-universe__orbit--inner {
  inset: 46px;
  animation-direction: reverse;
  animation-duration: 15s;
}

.hub-universe__satellite {
  position: absolute;
  display: grid;
  place-items: center;
}

.hub-universe__satellite--bead {
  top: 37px;
  right: 25px;
  width: 30px;
  height: 30px;
  border: 5px solid #fff;
  border-radius: 50%;
  background: var(--hub-orange);
  box-shadow: 0 4px 15px rgba(99, 63, 48, 0.18);
}

.hub-universe__satellite--note {
  bottom: 20px;
  left: 12px;
  width: 42px;
  height: 42px;
  border: 3px solid #fff;
  border-radius: 12px;
  background: #f2cf75;
  color: #6a5117;
  font-size: 14px;
  font-style: normal;
  font-weight: 800;
  box-shadow: 0 6px 18px rgba(87, 66, 19, 0.16);
}

.hub-universe__egg {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 160px;
  height: 205px;
  overflow: hidden;
  border: 1px solid rgba(81, 88, 161, 0.16);
  border-radius: 50% 50% 46% 46% / 58% 58% 42% 42%;
  background: linear-gradient(145deg, #fff 18%, #eceeff 72%, #e2dff5);
  box-shadow:
    0 34px 65px rgba(77, 79, 130, 0.2),
    inset -18px -20px 34px rgba(92, 102, 192, 0.1);
  transform: translate(-50%, -50%) rotate(6deg);
  animation: egg-float 4s ease-in-out infinite;
}

.hub-universe__shine {
  position: absolute;
  top: 32px;
  left: 31px;
  width: 35px;
  height: 70px;
  border-radius: 50%;
  background: rgba(#fff, 0.8);
  transform: rotate(28deg);
  filter: blur(5px);
}

.hub-universe__face {
  position: absolute;
  top: 96px;
  left: 50%;
  width: 64px;
  height: 36px;
  transform: translateX(-50%);

  i {
    position: absolute;
    top: 0;
    width: 7px;
    height: 10px;
    border-radius: 50%;
    background: var(--hub-ink);

    &:first-child {
      left: 10px;
    }

    &:nth-child(2) {
      right: 10px;
    }
  }

  b {
    position: absolute;
    bottom: 4px;
    left: 50%;
    width: 18px;
    height: 9px;
    border-bottom: 3px solid var(--hub-orange);
    border-radius: 50%;
    transform: translateX(-50%);
  }
}

.hub-universe__label {
  position: absolute;
  padding: 7px 11px;
  border: 1px solid rgba(#fff, 0.8);
  border-radius: 999px;
  background: rgba(#fff, 0.75);
  color: $pindou-text-secondary;
  font-size: 10px;
  font-weight: 700;
  box-shadow: 0 8px 20px rgba(60, 58, 78, 0.1);
  backdrop-filter: blur(8px);
}

.hub-universe__label--ideas {
  top: 26%;
  left: -2%;
  transform: rotate(-8deg);
}

.hub-universe__label--tools {
  right: -2%;
  bottom: 26%;
  transform: rotate(7deg);
}

.hub-products {
  scroll-margin-top: 20px;
  padding: 30px 0 90px;
}

.hub-section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;

  p {
    margin: 0 0 6px;
    color: var(--hub-orange);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.16em;
  }

  h2 {
    margin: 0;
    font-family: $pindou-font-display;
    font-size: clamp(27px, 5vw, 38px);
    line-height: 1.1;
    letter-spacing: -0.035em;
  }

  > span {
    color: $pindou-text-muted;
    font-size: 11px;
  }
}

.hub-product-grid {
  display: grid;
  gap: 16px;
}

.product-card {
  position: relative;
  display: flex;
  min-height: 580px;
  overflow: hidden;
  flex-direction: column;
  border: 1px solid rgba(62, 62, 83, 0.12);
  border-radius: 28px;
  color: var(--hub-ink);
  text-decoration: none;
  box-shadow: 0 20px 55px rgba(49, 46, 58, 0.11);
  transition: transform 0.35s $pindou-ease-out, box-shadow 0.35s ease;

  &:hover {
    transform: translateY(-7px) rotate(-0.3deg);
    box-shadow: 0 28px 70px rgba(49, 46, 58, 0.17);

    .product-card__action i {
      transform: translate(3px, -3px);
    }
  }
}

.product-card--pindou {
  background: linear-gradient(160deg, #f2f4ff, #dfe4ff 48%, #fffaf4);
}

.product-card--toolbox {
  background: linear-gradient(160deg, #fff9eb, #f9ead9 46%, #fff);

  &:hover {
    transform: translateY(-7px) rotate(0.3deg);
  }
}

.product-card--watermark {
  background: linear-gradient(160deg, #eef3ff, #dce6ff 46%, #f6f8ee);

  &:hover {
    transform: translateY(-7px) rotate(-0.2deg);
  }
}

.product-card__top {
  position: absolute;
  top: 18px;
  left: 18px;
  right: 18px;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-card__number {
  font-family: $pindou-font-display;
  font-size: 11px;
  font-weight: 800;
}

.product-card__state {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 9px;
  border: 1px solid rgba(#fff, 0.7);
  border-radius: 999px;
  background: rgba(#fff, 0.55);
  color: $pindou-text-secondary;
  font-size: 9px;
  font-weight: 700;
  backdrop-filter: blur(8px);

  i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4ba979;
    box-shadow: 0 0 0 3px rgba(75, 169, 121, 0.12);
  }
}

.pindou-art,
.toolbox-art,
.watermark-art {
  position: relative;
  height: 270px;
  overflow: hidden;
}

.pindou-art {
  display: grid;
  grid-template-columns: repeat(6, 28px);
  grid-auto-rows: 28px;
  gap: 7px;
  place-content: center;
  transform: rotate(-5deg) scale(1.08);
}

.pindou-art__bead {
  border: 4px solid rgba(#fff, 0.7);
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 4px 10px rgba(48, 51, 99, 0.12);

  &:nth-child(4n + 1) {
    background: #6878e7;
  }

  &:nth-child(5n + 2) {
    background: #ee8b68;
  }

  &:nth-child(6n + 3) {
    background: #f2cf75;
  }

  &:nth-child(7n + 4) {
    background: #79bd9b;
  }

  &:nth-child(8n + 5) {
    background: #a594d8;
  }
}

.pindou-art__bead--1,
.pindou-art__bead--6,
.pindou-art__bead--31,
.pindou-art__bead--36 {
  opacity: 0;
}

.pindou-art__cursor {
  position: absolute;
  right: 16%;
  bottom: 16%;
  display: grid;
  width: 45px;
  height: 45px;
  place-items: center;
  border-radius: 14px;
  background: #fff;
  color: var(--hub-orange);
  font-size: 18px;
  box-shadow: 0 8px 20px rgba(47, 47, 72, 0.16);
  transform: rotate(5deg);
}

.toolbox-art {
  background-image:
    linear-gradient(rgba(99, 69, 39, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99, 69, 39, 0.05) 1px, transparent 1px);
  background-size: 23px 23px;
}

.toolbox-art__window {
  position: absolute;
  top: 56px;
  left: 50%;
  width: 218px;
  height: 158px;
  padding: 50px 22px 20px;
  border: 1px solid rgba(92, 64, 39, 0.12);
  border-radius: 17px;
  background: rgba(#fff, 0.82);
  box-shadow: 0 22px 45px rgba(90, 61, 35, 0.16);
  transform: translateX(-50%) rotate(3deg);
  backdrop-filter: blur(8px);
}

.toolbox-art__bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 5px;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(92, 64, 39, 0.08);

  i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #e5d9ca;

    &:first-child {
      background: var(--hub-orange);
    }
  }
}

.toolbox-art__line {
  display: block;
  width: 82%;
  height: 8px;
  margin-bottom: 15px;
  border-radius: 999px;
  background: #e8e0d7;
}

.toolbox-art__line--title {
  width: 54%;
  height: 12px;
  background: #655d57;
}

.toolbox-art__line--short {
  width: 68%;
}

.toolbox-art__check {
  position: absolute;
  right: 21px;
  bottom: 20px;
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  border-radius: 7px;
  background: #dfeee5;
  color: #43805b;
  font-size: 11px;
  font-weight: 800;
}

.toolbox-art__egg {
  position: absolute;
  z-index: 2;
  top: 34px;
  left: 13%;
  display: grid;
  width: 58px;
  height: 72px;
  place-items: center;
  border: 3px solid #fff;
  border-radius: 50% 50% 46% 46% / 58% 58% 42% 42%;
  background: var(--hub-blue);
  color: #fff;
  font-family: $pindou-font-display;
  font-size: 25px;
  font-weight: 800;
  box-shadow: 0 10px 25px rgba(58, 65, 135, 0.2);
  transform: rotate(-8deg);
}

.toolbox-art__tag {
  position: absolute;
  z-index: 2;
  padding: 6px 10px;
  border: 1px solid #fff;
  border-radius: 999px;
  background: rgba(#fff, 0.82);
  color: $pindou-text-secondary;
  font-size: 9px;
  font-weight: 700;
  box-shadow: 0 7px 17px rgba(71, 51, 33, 0.1);
}

.toolbox-art__tag--top {
  top: 63px;
  right: 11%;
  transform: rotate(7deg);
}

.toolbox-art__tag--bottom {
  bottom: 37px;
  left: 13%;
  transform: rotate(-5deg);
}

.watermark-art {
  background: #173e9b;
}

.watermark-art__grid {
  position: absolute;
  inset: 0;
  opacity: 0.18;
  background-image:
    linear-gradient(rgba(#fff, 0.65) 1px, transparent 1px),
    linear-gradient(90deg, rgba(#fff, 0.65) 1px, transparent 1px);
  background-size: 22px 22px;
  transform: rotate(-6deg) scale(1.2);
}

.watermark-art__file {
  position: absolute;
  top: 46px;
  left: 50%;
  width: 194px;
  height: 170px;
  padding: 15px;
  border: 4px solid rgba(#fff, 0.9);
  border-radius: 10px;
  background: #f7f4e9;
  box-shadow: 0 22px 42px rgba(8, 24, 61, 0.3);
  transform: translateX(-50%) rotate(4deg);

  b {
    position: absolute;
    top: 77px;
    left: 50%;
    color: rgba(21, 79, 209, 0.48);
    font-family: $pindou-font-display;
    font-size: 22px;
    letter-spacing: 0.08em;
    transform: translateX(-50%) rotate(-18deg);
  }
}

.watermark-art__photo {
  display: block;
  height: 110px;
  border-radius: 4px;
  background:
    radial-gradient(circle at 68% 30%, #f7ce74 0 12px, transparent 13px),
    linear-gradient(145deg, transparent 44%, #6f9ad9 45% 65%, #304e89 66%);
}

.watermark-art__scan {
  position: absolute;
  right: 15px;
  bottom: 18px;
  left: 15px;
  height: 2px;
  background: #ff7657;
  box-shadow: 0 0 11px rgba(255, 101, 66, 0.7);
}

.watermark-art__seal {
  position: absolute;
  top: 28px;
  right: 12%;
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  border: 3px double #203153;
  border-radius: 50%;
  background: #d8ff4f;
  color: #203153;
  font-family: $pindou-font-display;
  font-size: 26px;
  font-weight: 800;
  box-shadow: 0 8px 20px rgba(10, 28, 67, 0.24);
  transform: rotate(11deg);
}

.watermark-art__tag {
  position: absolute;
  bottom: 24px;
  left: 9%;
  padding: 7px 10px;
  border: 1px solid rgba(#fff, 0.5);
  border-radius: 999px;
  background: rgba(#132e6f, 0.72);
  color: #d8ff4f;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.15em;
  backdrop-filter: blur(6px);
  transform: rotate(-5deg);
}

.product-card__body {
  display: flex;
  flex: 1;
  padding: 26px 25px 25px;
  flex-direction: column;
  border-top: 1px solid rgba(57, 57, 72, 0.08);
  background: rgba(#fff, 0.68);
  backdrop-filter: blur(12px);

  h3 {
    margin: 5px 0 13px;
    font-family: $pindou-font-display;
    font-size: clamp(27px, 5vw, 34px);
    line-height: 1.1;
    letter-spacing: -0.035em;

    span {
      font-family: $pindou-font-body;
      font-size: 0.52em;
      letter-spacing: 0;
    }
  }

  > p:not(.product-card__category) {
    margin: 0;
    color: $pindou-text-secondary;
    font-size: 12px;
    line-height: 1.75;
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 17px 0 24px;
    padding: 0;
    list-style: none;
  }

  li {
    padding: 5px 9px;
    border: 1px solid rgba(69, 69, 90, 0.1);
    border-radius: 999px;
    background: rgba(#fff, 0.5);
    color: $pindou-text-secondary;
    font-size: 9px;
    font-weight: 600;
  }
}

.product-card__category {
  margin: 0;
  color: var(--hub-blue);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.16em;

  .product-card--toolbox & {
    color: var(--hub-orange);
  }

  .product-card--watermark & {
    color: #3157b5;
  }
}

.product-card__action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 17px;
  border-top: 1px solid rgba(56, 56, 72, 0.1);
  font-size: 12px;
  font-weight: 800;

  i {
    display: grid;
    width: 32px;
    height: 32px;
    place-items: center;
    border-radius: 50%;
    background: var(--hub-blue);
    color: #fff;
    font-size: 15px;
    font-style: normal;
    transition: transform 0.25s ease;

    .product-card--toolbox & {
      background: var(--hub-orange);
    }

    .product-card--watermark & {
      background: #173e9b;
    }
  }
}

.hub-principles {
  padding: 10px 0 80px;
}

.hub-principles__intro {
  margin: 0 0 18px;
  color: $pindou-text-muted;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.hub-principles__list {
  display: grid;
  gap: 10px;

  article {
    position: relative;
    padding: 21px;
    border: 1px solid rgba(62, 61, 80, 0.1);
    border-radius: 19px;
    background: rgba(#fff, 0.5);
    backdrop-filter: blur(8px);
  }

  span {
    position: absolute;
    top: 18px;
    right: 18px;
    color: rgba(78, 80, 114, 0.3);
    font-family: $pindou-font-display;
    font-size: 10px;
    font-weight: 800;
  }

  strong {
    font-family: $pindou-font-display;
    font-size: 16px;
  }

  p {
    margin: 7px 0 0;
    color: $pindou-text-muted;
    font-size: 11px;
    line-height: 1.6;
  }
}

.hub-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 25px 0 calc(25px + var(--pindou-safe-bottom));
  border-top: 1px solid rgba(64, 62, 79, 0.1);
  color: $pindou-text-muted;
  font-size: 10px;

  > div {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  strong {
    color: var(--hub-ink);
    font-size: 11px;
  }

  p {
    margin: 0;
  }
}

.hub-footer__egg {
  width: 16px;
  height: 20px;
  border-radius: 50% 50% 46% 46% / 58% 58% 42% 42%;
  background: linear-gradient(145deg, var(--hub-blue), #8a96ec);
  transform: rotate(-6deg);
}

@media (min-width: 760px) {
  .hub-hero {
    grid-template-columns: minmax(0, 1.1fr) minmax(340px, 0.7fr);
    padding-top: 70px;
  }

  .hub-principles__list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 980px) {
  .hub-product-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 760px) and (max-width: 979px) {
  .hub-product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .product-card--watermark {
    grid-column: 1 / -1;
    width: calc(50% - 8px);
    justify-self: center;
  }
}

@media (max-width: 759px) {
  .hub-hero {
    min-height: auto;
  }

  .hub-universe {
    order: -1;
    width: min(80vw, 330px);
    height: min(80vw, 330px);
  }

  .hub-universe__egg {
    width: 132px;
    height: 170px;
  }

  .hub-universe__face {
    top: 80px;
  }
}

@media (max-width: 560px) {
  .hub-header {
    align-items: flex-start;
  }

  .hub-nav {
    max-width: 54vw;
    overflow-x: auto;
    justify-content: flex-start;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    a {
      flex: 0 0 auto;
    }
  }

  .hub-hero {
    padding-top: 34px;
  }

  .hub-section-head > span {
    display: none;
  }

  .product-card {
    min-height: 560px;
  }

  .hub-footer {
    align-items: flex-start;
    flex-direction: column;

    > div span:last-child {
      display: none;
    }
  }
}

@keyframes universe-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes egg-float {
  0%,
  100% {
    transform: translate(-50%, -50%) rotate(6deg) translateY(0);
  }
  50% {
    transform: translate(-50%, -50%) rotate(3deg) translateY(-9px);
  }
}

@keyframes star-twinkle {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.15);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hub-universe__orbit,
  .hub-universe__egg,
  .hub__star {
    animation: none;
  }

  .product-card {
    transition: none;
  }
}
</style>
