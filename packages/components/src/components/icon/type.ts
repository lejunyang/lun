import { ExtractPropTypes } from 'vue';
import { IconLibraryValue, IconNameValue } from './icon.default';
import { CommonProps, GetEventMapFromEmits, GetEventPropsFromEmits, PropString, themeProps } from 'common';
import { freeze } from '@lun-web/utils';

export const iconProps = freeze({
  /**
   * @locale.zh-CN 图标库名称，未指定或为 default 时使用内置图标库
   * @locale.en Name of the icon library; uses the built-in library when omitted or set to default
   * @default 'default'
   */
  library: PropString<IconLibraryValue>(),
  /**
   * @locale.zh-CN 图标名称，需与所选图标库中的图标对应
   * @locale.en Icon name; must match an icon registered in the selected library
   */
  name: PropString<IconNameValue>(),
  /**
   * @locale.zh-CN 当该图标的最后一个实例卸载时，自动清除其解析结果缓存
   * @locale.en Automatically clear the resolved icon cache when the last instance of this icon unmounts
   */
  autoClearCache: PropString(),
  /**
   * @locale.zh-CN 主题状态，用于设置图标语义颜色
   * @locale.en Theme status used to set the icon's semantic color
   */
  status: themeProps.status,
});

export const iconEmits = freeze({});

export type IconSetupProps = ExtractPropTypes<typeof iconProps> & CommonProps;
export type IconEventProps = GetEventPropsFromEmits<typeof iconEmits>;
export type IconEventMap = GetEventMapFromEmits<typeof iconEmits>;
export type IconProps = Partial<IconSetupProps> & IconEventProps;
