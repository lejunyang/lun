import { AriaAttributes, EventHandlers, Events } from '@vue/runtime-dom';

declare module 'vue' {
  // 'part' attribute missed in @vue/runtime-dom(3.3.4)
  interface HTMLAttributes extends AriaAttributes, EventHandlers<Events> {
		part?: string;
  }
  interface SVGAttributes extends AriaAttributes, EventHandlers<Events> {
    part?: string;
  }
}

