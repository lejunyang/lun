<template>
  <!-- appearance needs to be undefined when SSR -->
  <l-theme-provider :appearance="!inBrowser ? undefined : isDark ? 'dark' : 'light'" root v-bind="theme">
    <Layout>
      <template #nav-bar-content-after>
        <ThemeConfigPanel :theme="theme" :lang="lang as any" :animate="randomAnimate" />
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
import { watchEffect, nextTick, provide, reactive, onMounted } from 'vue';
import ThemeConfigPanel from '../../../components/ThemeConfigPanel.vue';
import { GlobalContextConfig } from '@lun/components';
import Giscus from '@giscus/vue';
import { on, AnyFn, withResolvers } from '@lun/utils';

const Layout = Theme.Layout;

const theme = reactive({
  color: 'indigo',
  // grayColor: 'slate', // need to use kecab-case for SSR
  'gray-color': 'slate',
  size: '2',
  radius: 'medium',
  scale: '1',
});

const { isDark, lang, page } = useData();
let lastClickX = 0,
  lastClickY = 0;

const swapZ = (scale = 0.8, duration = 500) => {
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
      pseudoElement: '::view-transition-old(root)',
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
      pseudoElement: '::view-transition-new(root)',
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

onMounted(() => {
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

const animationPool = [swapZ, polygonSlide, circleGrow];
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
let routeResolve: (() => void) | undefined, transitionPromise: Promise<any> | undefined;
router.onBeforeRouteChange = () => {
  if (document.startViewTransition) {
    transitionPromise = document.startViewTransition(() => {
      const { promise, resolve } = withResolvers();
      routeResolve = resolve;
      return promise;
    }).ready;
  }
};
router.onAfterRouteChanged = async () => {
  if (routeResolve) {
    routeResolve();
    routeResolve = undefined;
  }
  if (transitionPromise) {
    await transitionPromise;
    transitionPromise = undefined;
    swapZ(0.95, 300);
  }
};

watchEffect(() => {
  if (inBrowser) {
    document.cookie = `nf_lang=${lang.value}; path=/`;
  }
  GlobalContextConfig.lang = lang.value;
});
</script>

<style>
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

giscus-widget::part(iframe) {
  margin-top: 24px;
}
</style>
