import { freeze } from '@lun-web/utils';
import {
  GetEventMapFromEmits,
  GetEventPropsFromEmits,
  Prop,
  PropArray,
  PropBoolean,
  PropFunction,
  PropNumber,
  PropNumOrFunc,
  PropObject,
  PropStrOrFunc,
} from 'common';
import { ExtractPropTypes } from 'vue';
import { UseVirtualMeasurement } from '@lun-web/core';

const mainAxisProps = {
  /**
   * @locale.zh-CN 需要进行虚拟渲染的数据列表
   * @locale.en Data list to be virtualized and rendered.
   */
  items: PropArray(),
  /**
   * @locale.zh-CN 用于获取每一项唯一 key 的字段名或函数，缺省时使用索引作为 key
   * @locale.en Field name or function used to derive each item's unique key; falls back to the index when omitted.
   */
  itemKey: PropStrOrFunc<(item: any, index: number) => string | number>(),
  /**
   * @locale.zh-CN 每一项的预估尺寸，可为数字或返回数字的函数，用于在测量前估算总尺寸
   * @locale.en Estimated size of each item; can be a number or a function returning a number, used before real measurement.
   */
  estimatedSize: PropNumOrFunc<((item: any, index: number) => number) | number | string>(),
  /**
   * @locale.zh-CN 每一项的固定尺寸，设置后将不再对项进行测量
   * @locale.en Fixed size of each item; when set, items will not be measured.
   */
  fixedSize: PropNumOrFunc<((item: any, index: number) => number) | number | string>(),
  /**
   * @locale.zh-CN 可视区域前后额外渲染的项数，可分别指定前后数量，也可传入函数动态计算
   * @locale.en Number of extra items rendered before and after the visible range; can be a single number, a tuple, or a function.
   * @default 10
   */
  overscan: Prop<
    number | string | [number, number] | ((items: any[], containerSize: number) => number | [number, number])
  >(),
  /**
   * @locale.zh-CN 容器的初始尺寸，在尚未测量到真实尺寸前用于计算可视范围
   * @locale.en Initial container size used to compute the visible range before the real size is measured.
   */
  initialContainerSize: PropNumber(),
  /**
   * @locale.zh-CN 是否监听容器尺寸变化，开启后将在容器大小改变时自动重新计算
   * @locale.en Whether to observe the container's size and recompute when it changes.
   */
  observeContainerSize: PropBoolean(),
  /**
   * @locale.zh-CN 相邻两项之间的间距
   * @locale.en Gap between adjacent items.
   */
  gap: PropNumber(),
  /**
   * @locale.zh-CN 主轴方向上的列数（或行数），大于 1 时可实现瀑布流布局
   * @locale.en Number of lanes along the main axis; values greater than 1 enable masonry-style layouts.
   * @default 1
   */
  lanes: PropNumber(),
};

type MainAxisProps = ExtractPropTypes<typeof mainAxisProps>;

export const virtualRendererProps = freeze({
  /**
   * @locale.zh-CN 是否使用水平方向作为主滚动轴
   * @locale.en Whether to use the horizontal direction as the main scroll axis.
   */
  horizontal: PropBoolean(),
  /**
   * @locale.zh-CN 用于渲染每一个虚拟项的函数，接收当前项、主轴可见项列表和交叉轴可见项列表
   * @locale.en Function used to render each virtual item; receives the current item plus the main- and cross-axis visible item lists.
   */
  renderer:
    PropFunction<
      (i: UseVirtualMeasurement, mainAxisItems: UseVirtualMeasurement[], crossAxisItems: UseVirtualMeasurement[]) => any
    >(),
  ...mainAxisProps,
  /**
   * @locale.zh-CN 交叉轴的虚拟化配置，结构与主轴属性相同，用于实现二维虚拟滚动
   * @locale.en Virtualization options for the cross axis; shares the same shape as the main-axis props and enables 2D virtual scrolling.
   */
  crossAxis: PropObject<MainAxisProps>(),
  /**
   * @locale.zh-CN 当虚拟项无法使用绝对定位时启用，组件会通过 transform 调整包裹元素的偏移
   * @locale.en Enable when items cannot use absolute positioning; the wrapper's offset is then adjusted via transform.
   */
  staticPosition: PropBoolean(),
});

export const virtualRendererEmits = freeze({});

export type VirtualRendererSetupProps = ExtractPropTypes<typeof virtualRendererProps>;
export type VirtualRendererEventProps = GetEventPropsFromEmits<typeof virtualRendererEmits>;
export type VirtualRendererEventMap = GetEventMapFromEmits<typeof virtualRendererEmits>;
export type VirtualRendererProps = Partial<VirtualRendererSetupProps> & VirtualRendererEventProps;
