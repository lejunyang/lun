import { AriaAttributes, EventHandlers, Events } from 'vue';

declare module 'vue' {
  // some attributes missed in @vue/runtime-dom(3.3.4)
  interface HTMLAttributes extends AriaAttributes, EventHandlers<Events> {
    part?: string;
    slot?: string;
    popover?: boolean | 'manual' | 'auto';
  }
  interface SVGAttributes extends AriaAttributes, EventHandlers<Events> {
    part?: string;
  }
}
