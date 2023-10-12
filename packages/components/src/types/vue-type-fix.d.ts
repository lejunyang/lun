import { AriaAttributes, EventHandlers, Events } from '@vue/runtime-dom';

declare module 'vue' {
  // some attributes missed in @vue/runtime-dom(3.3.4)
  export interface HTMLAttributes extends AriaAttributes, EventHandlers<Events> {
    part?: string;
    slot?: string;
    popover?: boolean | 'manual' | 'auto';
  }
  export interface SVGAttributes extends AriaAttributes, EventHandlers<Events> {
    part?: string;
  }
}
