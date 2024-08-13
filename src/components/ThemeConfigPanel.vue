<template>
  <!-- TODO change strategy to absolute when max-width: 768px because of layout change -->
  <l-popover triggers="click" class="theme-popover" shift flip size="2" strategy="fixed">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="currentColor"
      style="color: var(--vp-c-text-2)"
      viewBox="0 0 16 16"
    >
      <path
        d="M8 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m4 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M5.5 7a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"
      />
      <path
        d="M16 8c0 3.15-1.866 2.585-3.567 2.07C11.42 9.763 10.465 9.473 10 10c-.603.683-.475 1.819-.351 2.92C9.826 14.495 9.996 16 8 16a8 8 0 1 1 8-8m-8 7c.611 0 .654-.171.655-.176.078-.146.124-.464.07-1.119-.014-.168-.037-.37-.061-.591-.052-.464-.112-1.005-.118-1.462-.01-.707.083-1.61.704-2.314.369-.417.845-.578 1.272-.618.404-.038.812.026 1.16.104.343.077.702.186 1.025.284l.028.008c.346.105.658.199.953.266.653.148.904.083.991.024C14.717 9.38 15 9.161 15 8a7 7 0 1 0-7 7"
      />
    </svg>
    <div slot="pop-content" class="theme-panel">
      <strong>{{ locales[lang]?.components.color }}</strong>
      <l-radio-group size="3" v-update="theme.color">
        <l-radio v-for="color in themeColors" :key="color" :value="color" :color="color" no-indicator :title="color">
          <div class="circle" :style="{ background: `var(--l-${color}-9)` }"></div>
        </l-radio>
      </l-radio-group>
      <strong>{{ locales[lang]?.components.grayColor }}</strong>
      <l-radio-group size="3" v-update="theme['gray-color']">
        <l-radio v-for="color in grayColors" :key="color" :value="color" :color="color" no-indicator :title="color">
          <div class="circle" :style="{ background: `var(--l-${color}-9)` }"></div>
        </l-radio>
      </l-radio-group>
      <strong>{{ locales[lang]?.components.appearance }}</strong>
      <VPSwitchAppearance id="switch-appearance" />
      <strong>{{ locales[lang]?.components.size }}</strong>
      <l-radio-group v-update="theme.size">
        <l-radio value="1" size="1"
          ><span class="size-radio-label">{{ locales[lang]?.components.small }}</span></l-radio
        >
        <l-radio value="2" size="2"
          ><span class="size-radio-label">{{ locales[lang]?.components.medium }}</span></l-radio
        >
        <l-radio value="3" size="3"
          ><span class="size-radio-label">{{ locales[lang]?.components.large }}</span></l-radio
        >
      </l-radio-group>
      <strong>{{ locales[lang]?.components.radius }}</strong>
      <l-radio-group size="3" v-update="theme.radius" no-indicator style="row-gap: 0">
        <l-radio class="radius-radio" v-for="radius in radiuses" :value="radius" :key="radius" :radius="radius">
          <div class="wrapper"><div :class="`radius-image radius-${radius}`"></div></div>
          <div class="radius-text">{{ radius }}</div>
        </l-radio>
      </l-radio-group>
      <strong>{{ locales[lang]?.components.scale }}</strong>
      <l-radio-group size="2" v-update="theme.scale" type="card" style="--l-radio-group-gap: 12px">
        <l-radio v-for="scale in scales" :value="scale" :key="scale">
          {{ (+scale * 100).toFixed(0) + '%' }}
        </l-radio>
      </l-radio-group>
    </div>
  </l-popover>
</template>

<script setup lang="tsx">
import { themeColors, grayColors } from '@lun/components';
import VPSwitchAppearance from 'vitepress/dist/client/theme-default/components/VPSwitchAppearance.vue';
import locales from '../docs/.vitepress/locales';
import { AnyFn } from '@lun/utils';

const props = defineProps<{
  theme: {
    color: string;
    'gray-color': string;
    size: string;
    radius: string;
    scale: string;
  };
  lang: keyof typeof locales;
  animate: (update: AnyFn) => void;
}>();

const radiuses = ['none', 'small', 'medium', 'large', 'full'];
const scales = ['0.9', '0.95', '1', '1.05', '1.1'];
</script>

<style lang="scss">
// hide vitepress's default appearance switcher
.VPNavBarAppearance.appearance,
.VPNavScreenAppearance.appearance {
  display: none;
}
.theme-popover {
  margin-inline-start: 15px;
  svg {
    cursor: pointer;
  }
}
@media (max-width: 768px) {
  .theme-popover {
    margin-inline-end: 10px;
  }
}
.theme-panel {
  width: 280px;
  max-width: 100vw;
  max-height: calc(100vh - 70px);
  overflow: auto;
  padding: 5px 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  .size-radio-label {
    color: var(--l-gray-12);
  }
  .radius-radio {
    &[data-checked] .wrapper {
      outline: 2px solid var(--l-accent-9);
    }
    @supports not selector(:state(a)) {
      &:--checked .wrapper {
        outline: 2px solid var(--l-accent-9);
      }
    }
    &:state(checked) .wrapper {
      outline: 2px solid var(--l-accent-9);
    }
    .wrapper {
      outline: 1px solid var(---l-gray-7);
      padding: 12px;
    }
  }
  .radius-image {
    width: 40px;
    height: 40px;
    background: var(--l-accent-3);
    border-block-start: 2px solid var(--l-accent-a8);
    border-inline-start: 2px solid var(--l-accent-a8);
    border-start-start-radius: var(--l-radius-5);
  }
  .radius-text {
    text-align: center;
    font-size: 14px;
    color: var(--l-gray-9);
  }
  .radius-full {
    border-start-start-radius: 80%;
  }
}
.theme-panel, .theme-home-panel {
  l-radio-group {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  l-radio {
    .circle {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      outline-offset: 2px;
    }
    // cannot use ',' for these three selectors, as they would all fail if one of them is not supported
    &[data-checked] .circle {
      outline: 2px solid var(--l-accent-9);
    }
    @supports not selector(:state(a)) {
      &:--checked .circle {
        outline: 2px solid var(--l-accent-9);
      }
    }
    &:state(checked) .circle {
      outline: 2px solid var(--l-accent-9);
    }
  }
}
.VPSocialLinks.VPNavBarSocialLinks {
  margin-inline-end: 0px;
}
.VPFlyout.VPNavBarExtra.extra {
  margin-inline-end: 0px;
  .group.translations + .group {
    display: none;
  }
}
</style>
