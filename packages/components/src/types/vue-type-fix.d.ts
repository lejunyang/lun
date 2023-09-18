import { AriaAttributes, EventHandlers, Events } from '@vue/runtime-dom';

declare module 'vue' {
  // 'part' attribute missed in @vue/runtime-dom(3.3.4)
  export interface HTMLAttributes extends AriaAttributes, EventHandlers<Events> {
		part?: string;
  }
  export interface SVGAttributes extends AriaAttributes, EventHandlers<Events> {
    part?: string;
  }
}

