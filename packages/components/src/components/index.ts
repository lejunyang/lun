import { defineButton } from './button';
import { defineCustomRenderer } from './custom-renderer';
import { defineIcon } from './icon';
import { defineBaseInput, defineInput } from './input';

export function defineAllComponents() {
  defineButton();
  defineCustomRenderer();
  defineIcon();
  defineBaseInput();
  defineInput();
}

export * from './animation';
export * from './button';
export * from './config';
export * from './custom-renderer';
export * from './input';
export * from './icon';