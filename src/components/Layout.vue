<template>
  <!-- appearance needs to be undefined when SSR -->
  <l-theme-provider :appearance="!inBrowser ? undefined : isDark ? 'dark' : 'light'" root v-bind="theme">
    <Layout>
      <template #nav-bar-content-after>
        <ThemeConfigPanel :theme="theme" :lang="lang as any" :animate="randomAnimate" />
      </template>
      <template #home-hero-image>
        <div class="theme-home-panel" v-show="activeBreakpoint === 'lg' || activeBreakpoint === 'xl'">
          <l-radio-group class="color-group" size="3" v-update="theme.color">
            <l-radio v-for="color in themeColors" :value="color" :color="color" no-indicator :title="color">
              <div class="circle" :style="{ background: `var(--l-${color}-9)` }"></div>
            </l-radio>
          </l-radio-group>
          <l-tabs
            v-update-activeSlot="theme.radius"
            class="radius-tabs"
            no-panel
            type="vertical"
            :items="radiusTabs"
            variant="solid"
          ></l-tabs>
          <div class="start">
            <l-input variant="soft" value="input" style="transform: translateX(-30px)"></l-input>
            <l-radio-group v-update="theme.size" style="transform: translateX(-20px)">
              <l-radio value="1">1</l-radio>
              <l-radio value="2" variant="surface">2</l-radio>
              <l-radio value="3" high-contrast>3</l-radio>
            </l-radio-group>
            <l-button class="start-button" variant="solid" style="transform: translateX(-10px)">Get Started</l-button>
            <l-button class="start-button" variant="soft">View</l-button>
          </div>
          <VPSwitchAppearance class="appearance-switch" />
          <l-color-picker class="color-picker" panel-only></l-color-picker>
          <l-callout class="callout" variant="soft" icon-name="info" message="Try selecting some text below">
            <l-popover triggers="select" content="This is help text" slot="description">{{ text }}</l-popover>
          </l-callout>
        </div>
      </template>
      <template #doc-after>
        <ClientOnly>
          <Giscus
            repo="lejunyang/lun"
            repo-id="R_kgDOKRu0ww"
            mapping="pathname"
            category="Announcements"
            category-id="DIC_kwDOKRu0w84Cccsd"
            strict="0"
            reactions-enabled="1"
            emit-metadata="0"
            input-position="top"
            loading="lazy"
            :lang="lang"
            :theme="isDark ? 'dark' : 'light'"
            :key="page.filePath"
          />
        </ClientOnly>
      </template>
    </Layout>
  </l-theme-provider>
</template>
<script setup lang="ts">
import Theme from 'vitepress/theme';
import { useData, inBrowser, useRouter } from 'vitepress';
import VPSwitchAppearance from 'vitepress/dist/client/theme-default/components/VPSwitchAppearance.vue';
import { watchEffect, nextTick, provide, reactive, onMounted, onBeforeUnmount } from 'vue';
import ThemeConfigPanel from './ThemeConfigPanel.vue';
import { GlobalContextConfig, Progress, themeColors, activeBreakpoint } from '@lun/components';
import Giscus from '@giscus/vue';
import { on, AnyFn, withResolvers } from '@lun/utils';
import { text } from '../utils/data';

const Layout = Theme.Layout;

const theme = reactive({
  color: 'indigo',
  // grayColor: 'slate', // need to use kecab-case for SSR
  'gray-color': 'slate',
  size: '2',
  radius: 'medium',
  scale: '1',
});

const radiuses = ['none', 'small', 'medium', 'large', 'full'];
const radiusTabs = radiuses.map((r) => ({ slot: r, label: r }));

const { isDark, lang, page } = useData();
let lastClickX = 0,
  lastClickY = 0;

const swapZ = (name = 'root', scale = 0.8, duration = 500) => {
  document.documentElement.animate(
    [
      {
        transform: 'scale(1)',
        opacity: 1,
      },
      {
        transform: `scale(${scale})`,
        opacity: 0,
      },
    ],
    {
      duration,
      easing: 'ease-in-out',
      pseudoElement: `::view-transition-old(${name})`,
    },
  );
  document.documentElement.animate(
    [
      {
        transform: `scale(${scale})`,
        opacity: 0,
      },
      {
        transform: 'scale(1)',
        opacity: 1,
      },
    ],
    {
      duration,
      easing: 'ease-in-out',
      pseudoElement: `::view-transition-new(${name})`,
    },
  );
};

const polygonSlide = () => {
  document.documentElement.animate(
    [
      {
        clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)',
      },
      {
        clipPath: 'polygon(75% 0, 100% 0, 100% 100%, 60% 100%)',
        offset: 0.3,
      },
      {
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
    ],
    {
      duration: 700,
      easing: 'ease-in-out',
      pseudoElement: '::view-transition-new(root)',
    },
  );
};

const pullToSides = () => {
  document.documentElement.animate(
    [
      {
        clipPath: 'polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)',
      },
      {
        clipPath: 'polygon(40% 0%, 60% 0%, 75% 100%, 25% 100%)',
        offset: 0.3,
      },
      {
        clipPath: 'polygon(30% 0%, 70% 0%, 90% 100%, 10% 100%)',
        offset: 0.8,
      },
      {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0 100%)',
      },
    ],
    {
      duration: 700,
      easing: 'ease-in-out',
      pseudoElement: '::view-transition-new(root)',
    },
  );
};

const circleGrow = () => {
  const x = lastClickX,
    y = lastClickY;
  const right = window.innerWidth - x;
  const bottom = window.innerHeight - y;
  // Calculates the radius of circle that can cover the screen
  const maxRadius = Math.hypot(Math.max(x, right), Math.max(y, bottom));
  document.documentElement.animate(
    {
      clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`],
    },
    {
      duration: 500,
      easing: 'ease-in-out',
      pseudoElement: '::view-transition-new(root)',
    },
  );
};

let pageProgress: ReturnType<(typeof Progress)['createPageTopProgress']>;

onMounted(() => {
  pageProgress = Progress.createPageTopProgress({ destroyOnDone: false });
  on(
    document,
    'click',
    ({ clientX, clientY }: MouseEvent) => {
      lastClickX = clientX;
      lastClickY = clientY;
    },
    { capture: true },
  );
});
onBeforeUnmount(() => pageProgress.destroy());

const animationPool = [pullToSides, swapZ, polygonSlide, circleGrow];
const randomAnimate = async (update: AnyFn) => {
  if (document.startViewTransition) {
    await document.startViewTransition(async () => {
      update();
      await nextTick();
    }).ready;
    const index = Math.floor(Math.random() * animationPool.length);
    animationPool[index]();
  } else update();
};

const toggleAppearanceWithTransition = () => {
  return randomAnimate(() => (isDark.value = !isDark.value));
};

provide('toggle-appearance', toggleAppearanceWithTransition);

const router = useRouter();
let routeResolve: (() => void) | undefined, transitionReady: Promise<any> | undefined;

router.onBeforeRouteChange = () => {
  console.debug('on before route change');
  pageProgress.start();
};
// @ts-ignore
router.onAfterPageLoad = async () => {
  console.debug('on after page load');
  await pageProgress.stop();
  console.debug('page loading bar stopped');
  if (document.startViewTransition) {
    const transition = withResolvers();
    transitionReady = document.startViewTransition(async () => {
      const { promise, resolve } = withResolvers();
      routeResolve = resolve;
      transition.resolve();
      return promise;
    }).ready;
    return transition.promise;
  }
};
router.onAfterRouteChanged = async () => {
  if (routeResolve) {
    await nextTick();
    routeResolve();
    routeResolve = undefined;
  }
  if (transitionReady) {
    await transitionReady;
    transitionReady = undefined;
    swapZ('root', 0.95, 300);
  }
};

watchEffect(() => {
  if (inBrowser) {
    document.cookie = `nf_lang=${lang.value}; path=/`;
  }
  GlobalContextConfig.lang = lang.value;
});
</script>

<style lang="scss">
.VPDoc > .container {
  // view-transition-name: content; // this has some issues if new page has stored scroll position
}
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

@keyframes swapLeave {
  from {
    scale: 1;
    opacity: 1;
  }
  to {
    scale: 0.9;
    opacity: 0;
  }
}

@keyframes swapEnter {
  from {
    scale: 0.9;
    opacity: 0;
  }
  to {
    scale: 1;
    opacity: 1;
  }
}

::view-transition-old(content) {
  animation: swapLeave 0.3s ease-in-out;
}
::view-transition-new(content) {
  animation: swapEnter 0.3s ease-in-out;
}

giscus-widget::part(iframe) {
  margin-top: 24px;
}

@keyframes floatY {
  0% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
  50% {
    transform: translateY(4px);
  }
  70% {
    transform: translateY(-15px);
  }
  100% {
    transform: translateY(0);
  }
}

.theme-home-panel {
  display: grid;
  position: relative;
  justify-items: center;
  align-items: center;
  grid-template-columns: repeat(3, auto);
  & > * {
    animation: floatY 10s ease infinite;
  }
  & :hover {
    animation-play-state: paused;
  }
  .color-group {
    grid-area: 1/1/1/4;
    animation-delay: -3s;
    position: relative;
    inset-inline-start: -10%;
    inset-block-start: -10%;
  }
  .radius-tabs {
    grid-area: 2/3;
    animation-delay: -1s;
  }
  .appearance-switch {
    grid-area: 3/1;
    animation-delay: -2s;
  }
  .start {
    grid-area: 2/1;
    animation-delay: -1.5s;
    display: flex;
    flex-direction: column;
    align-items: end;
    gap: 10px;
  }
  .color-picker {
    animation-delay: -2.5s;
    grid-area: 2/2;
  }
  .callout {
    grid-area: 3/2/3/4;
    position: relative;
    inset-inline-start: 10%;
    inset-block-start: 10%;
  }
}
</style>
