<template>
  <l-popover triggers="click" class="theme-popover">
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
      <l-radio-group size="3" :value="theme.color" @update="theme.color = $event.detail">
        <l-radio v-for="color in themeColors" :key="color" :value="color" :color="color" no-indicator :title="color">
          <div class="circle" :style="{ background: `var(--l-${color}-9)` }"></div>
        </l-radio>
      </l-radio-group>
      <strong>{{ locales[lang]?.components.grayColor }}</strong>
      <l-radio-group size="3" :value="theme.grayColor" @update="theme.grayColor = $event.detail">
        <l-radio v-for="color in grayColors" :key="color" :value="color" :color="color" no-indicator :title="color">
          <div class="circle" :style="{ background: `var(--l-${color}-9)` }"></div>
        </l-radio>
      </l-radio-group>
      <strong>{{ locales[lang]?.components.appearance }}</strong>
      <VPSwitchAppearance id="switch-appearance" />
    </div>
  </l-popover>
</template>

<script setup lang="tsx">
import { themeColors, grayColors } from '@lun/components';
import VPSwitchAppearance from 'vitepress/dist/client/theme-default/components/VPSwitchAppearance.vue';
import locales from '../docs/.vitepress/locales';

const props = defineProps<{
  theme?: {
    color: string;
    grayColor: string;
  };
  lang?: string;
}>();
</script>

<style lang="scss">
// hide vitepress's default appearance switcher
.VPNavBarAppearance.appearance {
  display: none;
}
.theme-popover {
  svg {
    cursor: pointer;
  }
}
@media (max-width: 768px) {
  .VPNavBarExtra.extra {
    margin-inline: 0px;
  }
  .theme-popover {
    margin-inline-start: 15px;
    margin-inline-end: 10px;
  }
}
.theme-panel {
  width: 280px;
  max-width: 100vh;
  padding: 5px 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
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
    // cannot use ',' for these three selectors, as it would all fail if one of them is not supported
    &[data-checked] .circle {
      outline: 2px solid black;
    }
    &:--checked .circle {
      outline: 2px solid black;
    }
    &:state(checked) .circle {
      outline: 2px solid black;
    }
  }
}
.VPSocialLinks.VPNavBarSocialLinks {
  margin-inline-end: 10px;
}
</style>
