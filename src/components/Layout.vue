<template>
  <!-- appearance needs to be undefined when SSR -->
  <l-theme-provider :appearance="!inBrowser ? undefined : isDark ? 'dark' : 'light'" root v-bind="theme">
    <Layout>
      <template #nav-bar-content-after>
        <ThemeConfigPanel :theme="theme" :lang="lang as any" :animate="randomAnimate" />
      </template>
      <template #home-hero-image>
        <l-popover
          ref="popover"
          ignore-self
          freeze-when-closing
          auto-attach-attr="data-popover"
          class="theme-home-panel"
          v-content="activeBreakpoint === 'lg' || activeBreakpoint === 'xl'"
        >
          <l-radio-group class="color-group" size="3" v-update="theme.color" data-popover="color">
            <l-radio v-for="color in themeColors" :value="color" :color="color" no-indicator :title="color">
              <div class="circle" :style="{ background: `var(--l-${color}-9)` }"></div>
            </l-radio>
          </l-radio-group>
          <div slot="color">选择预设全局主题色</div>
          <l-tabs
            data-popover="radius"
            v-update-activeSlot="theme.radius"
            class="radius-tabs"
            no-panel
            type="vertical"
            :items="radiusTabs"
            variant="solid"
          ></l-tabs>
          <div slot="radius">选择全局的圆角</div>
          <div class="start">
            <l-input
              variant="soft"
              type="number"
              min="0.5"
              max="1.5"
              step="0.05"
              step-control="plus-minus"
              v-update="theme.scale"
              ref="scaleInput"
              style="transform: translateX(-30px)"
            ></l-input>
            <l-radio-group v-update="theme.size" style="transform: translateX(-20px)" ref="sizeGroup">
              <l-radio value="1">1</l-radio>
              <l-radio value="2" variant="surface">2</l-radio>
              <l-radio value="3" high-contrast>3</l-radio>
            </l-radio-group>
            <l-button class="start-button" variant="solid" style="transform: translateX(-10px)">
              <a :href="site.base + 'components/button/'">Get Started</a>
            </l-button>
            <l-button class="start-button" variant="soft"><a href="https://github.com/lejunyang/lun">View</a></l-button>
          </div>
          <div slot="scale">设置全局组件缩放系数</div>
          <div slot="size">选择全局组件大小</div>
          <l-switch
            :checked="isDark"
            @update="toggleAppearanceWithTransition"
            class="appearance-switch"
            data-popover="appearance"
          >
            <span
              :class="isDark ? 'vpi-moon moon' : 'vpi-sun sun'"
              slot="thumb"
              style="color: var(--l-accent-9); transform: scale(0.9)"
            />
          </l-switch>
          <div slot="appearance">是否开启暗黑模式</div>
          <l-color-picker
            data-popover="custom-color"
            class="color-picker"
            panel-only
            no-alpha
            @update="pickColorUpdate"
          ></l-color-picker>
          <div slot="custom-color">自定义全局主题色</div>
          <l-callout
            data-popover="callout"
            class="callout"
            variant="soft"
            icon-name="info"
            message="Try selecting some text below"
            :iconProps="{ style: { color: 'var(--l-accent-9)' } }"
          >
            <l-popover triggers="select" content="This is help text" slot="description">{{ text }}</l-popover>
          </l-callout>
          <div slot="callout">试试在这里选中一些文本</div>
        </l-popover>
      </template>
      <template #doc-after>
        <ClientOnly>
          <Giscus
            repo="lejunyang/lun"
            repo-id="R_kgDOKRu0ww"
            mapping="specific"
            :term="keyword"
            category="Comments"
            category-id="DIC_kwDOKRu0w84CkFaB"
            strict="1"
            reactions-enabled="1"
            emit-metadata="0"
            input-position="top"
            loading="lazy"
            :lang="lang"
            :theme="isDark ? 'dark' : 'light'"
            :key="page.filePath"
            v-if="!page.filePath.includes('palette')"
          />
        </ClientOnly>
      </template>
    </Layout>
  </l-theme-provider>
</template>
<script setup lang="ts">
import Theme from 'vitepress/theme';
import { useData, inBrowser, useRouter } from 'vitepress';
import {
  watchEffect,
  nextTick,
  provide,
  reactive,
  onMounted,
  onBeforeUnmount,
  useTemplateRef,
  watch,
  computed,
} from 'vue';
import ThemeConfigPanel from './ThemeConfigPanel.vue';
import { GlobalContextConfig, Progress, themeColors, activeBreakpoint, iPopover } from '@lun-web/components';
import Giscus from '@giscus/vue';
import { on, AnyFn, withResolvers } from '@lun-web/utils';
import { text } from '../utils/data';

const Layout = Theme.Layout;

const theme = reactive({
  color: 'indigo' as any,
  // grayColor: 'slate', // need to use kecab-case for SSR
  'gray-color': 'slate' as any,
  size: '2' as any,
  radius: 'medium' as any,
  scale: 1,
});

const sizeGroup = useTemplateRef('sizeGroup'),
  popover = useTemplateRef<iPopover>('popover'),
  scaleInput = useTemplateRef('scaleInput');

// if not in home page, popover is undefined
watch(popover, (p) => {
  if (!p) return;
  p.attachTarget(sizeGroup.value, { slotName: 'size' }); // if in other page, popover is undefined...
  p.attachTarget(scaleInput.value, { slotName: 'scale' });
});

provide('lun-theme', theme);

const radiuses = ['none', 'small', 'medium', 'large', 'full'];
const radiusTabs = radiuses.map((r) => ({ slot: r, label: r }));

const pickColorUpdate = (e: CustomEvent) => {
  theme.color = e.detail;
};

const { isDark, lang, page, site } = useData();
let lastClickX = 0,
  lastClickY = 0;

const keyword = computed(() => page.value.relativePath.replace('/index.md', ''));

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

const animationPool = [polygonSlide, pullToSides, swapZ, polygonSlide, polygonSlide, circleGrow, polygonSlide];
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

router.onAfterPageLoad = async () => {
  console.debug('on after page load');
  setTimeout(() => {
    console.debug('page info', page.value.relativePath, keyword.value, site.value.base);
  });
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
  console.debug('on after route changed');
  if (page.value.isNotFound) {
    return pageProgress.stop();
  }
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
  & > :not([slot]) {
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
