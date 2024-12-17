import { tabsEmits, tabsProps, defineTabs, TabsProps, iTabs } from '@lun-web/components';
import createComponent from '../createComponent';

export const LTabs = createComponent<TabsProps, iTabs>('tabs', defineTabs, tabsProps, tabsEmits);
if (__DEV__) LTabs.displayName = 'LTabs';
