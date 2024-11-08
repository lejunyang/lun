import { VNode, reactive } from 'vue';
import { isFunction, pick } from '@lun-web/utils';
import { defaultIconLibrary } from './icon.default';
import { warn } from 'utils';

export type IconLibraryResolver = (
  name: string,
  attrs: Record<string, unknown>,
) => string | VNode | Promise<string> | Promise<VNode>;
export type IconLibraryMutator = <T extends string | VNode>(result: T) => T;
export interface IconLibrary {
  library: string;
  type: 'html' | 'html-url' | 'vnode';
  resolver: IconLibraryResolver;
  mutator?: IconLibraryMutator;
}

export const iconRegistry: Record<string, IconLibrary> = reactive({
  default: defaultIconLibrary,
});

export function registerIconLibrary(options: IconLibrary) {
  if (!options?.library || !isFunction(options.resolver) || !options.type) {
    if (__DEV__)
      warn(`Register icon library failed, you may miss 'library', 'type' option, or 'resolver' is not a function`);
    return;
  }
  if (__DEV__ && iconRegistry[options.library]) {
    warn(`Icon library '${options.library}' already exists, it will be overwrite`);
  }
  iconRegistry[options.library] = pick(options, ['library', 'type', 'resolver', 'mutator']);
}
