import { defineTabs, TabsProps, iTabs } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LTabs = createComponent<TabsProps, iTabs>('tabs', defineTabs);
if (__DEV__) LTabs.displayName = 'LTabs';
