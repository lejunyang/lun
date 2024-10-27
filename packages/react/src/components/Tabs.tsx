
import { tabsEmits, TabsProps, tabsProps, defineTabs, iTabs } from '@lun/components';
import createComponent from '../createComponent';

export const LTabs = createComponent<TabsProps, iTabs>('tabs', defineTabs, tabsProps, tabsEmits);
if (__DEV__) LTabs.displayName = 'LTabs';
