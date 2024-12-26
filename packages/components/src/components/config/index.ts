import { TryGet } from '@lun-web/utils';
import { GlobalStaticConfig } from './config.static';
import { contextConfigs, staticConfig, UserComponents } from './utils';
import { GlobalContextConfig } from './config.context';

export * from './config.context';
export * from './config.static';
export {
  componentsWithTeleport,
  noShadowComponents,
  closedShadowComponents,
  openShadowComponents,
  components,
} from './utils';
export type { UserComponents, OpenShadowComponentKey, ComponentKey, ComponentStyles, DynamicStyleValue } from './utils';

/**
 * Used to add a new user component to the global config.
 * You need to declare your component name in the `UserComponents` interface like below to get correct type hints.
 * ```
 * declare module '@lun-web/components' {
 *   interface UserComponents {
 *     open: 'test' | 'test2';
 *   }
 * }
 * ```
 * @param name 
 */
export function addUserComponent(name: TryGet<UserComponents, 'open'>) {
  Object.entries(staticConfig).forEach(([key, value]) => {
    // @ts-ignore
    GlobalStaticConfig[key][name] = value[0]();
  });
  Object.entries(contextConfigs).forEach(([key, value]) => {
    // @ts-ignore
    GlobalContextConfig[key][name] = value[0]();
  });
}
