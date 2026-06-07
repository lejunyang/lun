import { PropType, ExtractPropTypes } from 'vue';
import {
  CommonProps,
  GetEventMapFromEmits,
  GetEventPropsFromEmits,
  LogicalPosition,
  PropBoolOrFunc,
  PropBoolean,
  PropFunction,
  PropNumber,
  PropObjOrFunc,
  PropObject,
  PropStrOrArr,
  PropString,
  Status,
  createEmits,
  createTransitionProps,
  editStateProps,
  sizeProp,
  themeProps,
  undefBoolProp,
} from 'common';
import { MaybePromise, CollectorContext, InputType, DatePanelType } from '@lun-web/core';
import { ComponentKey } from 'config';
import { FormProps } from '../form/type';
import { FormProvideExtra } from '../form';
import { freeze } from '@lun-web/utils';

export type ValidatorStatusResult = { status?: Status; message: string };
export type ValidatorResult = string | string[] | ValidatorStatusResult | ValidatorStatusResult[] | undefined | null;

export type Validator = (
  value: any,
  rawValue: any,
  data: any,
  rawData: any,
  rule: Rule,
  rawRule: RawRule,
) => MaybePromise<ValidatorResult>;

export type ValidateTrigger = 'blur' | 'update' | 'depChange' | 'input' | 'change';

export type ValidateMessages = {
  [key in RuleName]?: string | ((args: Rule) => string);
};

export type Condition = 'all-truthy' | 'some-truthy' | 'all-falsy' | 'some-falsy';

export const formItemRuleProps = {
  /**
   * @locale.zh-CN 字段的数据类型，用于内置校验器判断值的类型
   * @locale.en Data type of the field, used by the built-in validator to check the value type
   */
  type: PropString<InputType | DatePanelType>(), // can it be auto detected?
  /**
   * @locale.zh-CN 是否必填，可以传入函数根据表单上下文动态判断
   * @locale.en Whether the field is required; can be a function that decides dynamically from the form context
   */
  required: PropBoolOrFunc<boolean | ((formContext: FormProvideExtra) => boolean | undefined | null)>(),
  /**
   * @locale.zh-CN 校验时允许的最小值，对于字符串、数组则为最小长度
   * @locale.en Minimum allowed value during validation; for strings or arrays this is the minimum length
   */
  min: PropNumber(),
  /**
   * @locale.zh-CN 校验时允许的最大值，对于字符串、数组则为最大长度
   * @locale.en Maximum allowed value during validation; for strings or arrays this is the maximum length
   */
  max: PropNumber(),
  /**
   * @locale.zh-CN 校验时值必须严格大于该值
   * @locale.en Value must be strictly greater than this number during validation
   */
  greaterThan: PropNumber(),
  /**
   * @locale.zh-CN 校验时值必须严格小于该值
   * @locale.en Value must be strictly less than this number during validation
   */
  lessThan: PropNumber(),
  /**
   * @locale.zh-CN 校验时值需匹配的正则表达式
   * @locale.en Regular expression that the value must match during validation
   */
  pattern: PropString(RegExp),
  /**
   * @locale.zh-CN 校验时值的精确长度
   * @locale.en Exact length the value must have during validation
   */
  len: PropNumber(),
  /**
   * @locale.zh-CN 数值校验时的步长
   * @locale.en Step size used when validating numeric values
   */
  step: PropNumber(),
  /**
   * @locale.zh-CN 数值校验允许的小数精度位数
   * @locale.en Allowed decimal precision when validating numeric values
   */
  precision: PropNumber(),
};

export const formItemProps = freeze({
  ...editStateProps,
  ...themeProps,
  /**
   * @locale.zh-CN 表单项在表单数据中对应的字段路径，支持点号或数组形式的嵌套路径
   * @locale.en Field path of the form item in the form data; supports nested paths with dots or arrays
   */
  name: PropString(),
  /**
   * @locale.zh-CN 是否将 name 视为纯字符串字段名，禁用点号嵌套路径解析
   * @locale.en Treat name as a plain field name and disable dotted nested path parsing
   */
  plainName: undefBoolProp,
  /**
   * @locale.zh-CN 当前字段是否为数组类型，开启后每个子输入会按索引写入数组项
   * @locale.en Whether the current field is an array; when enabled each child input writes by index
   */
  array: PropBoolean(),

  /**
   * @locale.zh-CN 自动渲染的输入元素名称，例如 input、select、date-picker 等
   * @locale.en Component key of the input element to render automatically, e.g. input, select, date-picker
   */
  element: PropString<ComponentKey>(),
  /**
   * @locale.zh-CN 传给自动渲染输入元素的属性，支持对象或返回对象的函数
   * @locale.en Props passed to the auto-rendered input element; can be an object or a function returning one
   */
  elementProps: PropObjOrFunc<
    object | ((param: { formContext: CollectorContext<any, any, any> | undefined; formItemProps: any }) => any)
  >(),

  /**
   * @locale.zh-CN 用于动态隐藏表单项的函数，返回 true 时该表单项不渲染
   * @locale.en Function used to dynamically hide the form item; returning true skips rendering
   */
  hideWhen:
    PropFunction<
      (param: { formContext: CollectorContext<any, any, any> | undefined; formItemProps: any }) => boolean
    >(),

  // props for extra info
  /**
   * @locale.zh-CN 表单项的标签文本
   * @locale.en Label text of the form item
   */
  label: PropString(),
  /**
   * @locale.zh-CN 是否不渲染标签区域
   * @locale.en Whether to skip rendering the label area
   */
  noLabel: PropBoolean(),
  /**
   * @locale.zh-CN 标签后的冒号标记字符
   * @locale.en Colon mark rendered after the label
   * @default ':'
   */
  colonMark: PropString(),
  /**
   * @locale.zh-CN 必填项的标记字符
   * @locale.en Mark character displayed for required fields
   * @default '*'
   */
  requiredMark: PropString(),
  /**
   * @locale.zh-CN 输入框的提示文本；若存在校验错误信息则会被校验信息覆盖
   * @locale.en Tip text for the input; replaced by the validation message when a validation error is present
   */
  tip: PropString(),
  /**
   * @locale.zh-CN 表单项的帮助文本，始终会被渲染
   * @locale.en Help text for the form item; always rendered
   */
  help: PropString(),
  /**
   * @locale.zh-CN 帮助文本的展示方式：newLine 新行展示；tooltip 作为输入框 Tooltip 展示；icon 在标签处显示图标并作为图标的 Tooltip
   * @locale.en How the help text is displayed: newLine renders below the input; tooltip shows as the input's tooltip; icon renders an icon in the label with the help text as its tooltip
   * @default 'icon'
   */
  helpType: PropString<'newLine' | 'tooltip' | 'icon'>(),
  /**
   * @locale.zh-CN 提示和校验信息的展示方式：tooltip 以 Tooltip 形式展示；newLine 在输入框下方新行展示
   * @locale.en How tip and validation messages are displayed: tooltip shows as a tooltip; newLine renders below the input
   * @default 'tooltip'
   */
  tipType: PropString<'newLine' | 'tooltip'>(),
  /**
   * @locale.zh-CN 提示信息中是否展示对应状态的图标
   * @locale.en Whether to show the status icon alongside tip messages
   * @default true
   */
  tipShowStatusIcon: undefBoolProp,
  /**
   * @locale.zh-CN 控制哪些状态的信息会在表单项中展示，默认仅展示 error
   * @locale.en Which status messages are displayed in the form item; defaults to error only
   */
  visibleStatuses: PropStrOrArr<Status | Status[]>(),
  /**
   * @locale.zh-CN 最多展示的校验信息条数
   * @locale.en Maximum number of validation messages to display
   */
  maxValidationMsg: PropNumber(),
  ...createTransitionProps('tip'),

  // props for layout
  /**
   * @locale.zh-CN 表单项在网格布局中占据的行数
   * @locale.en Number of rows the form item spans in the grid layout
   */
  rowSpan: PropNumber(),
  /**
   * @locale.zh-CN 表单项在网格布局中占据的列数
   * @locale.en Number of columns the form item spans in the grid layout
   */
  colSpan: PropNumber(),
  /**
   * @locale.zh-CN 是否在新一行开始渲染该表单项
   * @locale.en Whether to start rendering this form item on a new row
   */
  newLine: PropBoolean(),
  /**
   * @locale.zh-CN 是否在当前行结束后换行
   * @locale.en Whether to end the current row after this form item
   */
  endLine: PropBoolean(),
  /**
   * @locale.zh-CN 是否独占整行
   * @locale.en Whether the form item occupies the whole row
   */
  fullLine: PropBoolean(),
  /**
   * @locale.zh-CN 标签宽度，支持响应式断点配置
   * @locale.en Width of the label; supports responsive breakpoint configuration
   */
  labelWidth: sizeProp,
  /**
   * @locale.zh-CN 标签文本的对齐方式
   * @locale.en Alignment of the label text
   */
  labelAlign: PropString<LogicalPosition>(),
  /**
   * @locale.zh-CN 必填标记的位置，位于标签前或后
   * @locale.en Position of the required mark relative to the label
   * @default 'start'
   */
  requiredMarkAlign: PropString<LogicalPosition>(),
  /**
   * @locale.zh-CN 标签容器的自定义样式
   * @locale.en Custom style applied to the label wrapper
   */
  labelWrapperStyle: PropObject(),
  /**
   * @locale.zh-CN 内容容器的自定义样式
   * @locale.en Custom style applied to the content wrapper
   */
  contentWrapperStyle: PropObject(),

  /**
   * @locale.zh-CN 表单项卸载时对应字段值的处理方式：delete 删除字段；toNull 置为 null；toUndefined 置为 undefined
   * @locale.en How to handle the field value when the form item unmounts: delete removes it; toNull sets null; toUndefined sets undefined
   */
  unmountBehavior: PropString<'delete' | 'toNull' | 'toUndefined'>(),
  /**
   * @locale.zh-CN 当前字段的依赖字段，依赖值变化时可触发清空、禁用、必填及重新校验等行为
   * @locale.en Dependencies of the current field; changes to these values can trigger clearing, disabling, requiring and revalidating
   */
  deps: PropStrOrArr(),
  /**
   * @locale.zh-CN 当依赖值变化时是否清空当前字段的值
   * @locale.en Whether to clear the current field's value when dependency values change
   */
  clearWhenDepChange: undefBoolProp, // must defaults to undefined as used in virtualGetMerge
  /**
   * @locale.zh-CN 根据依赖值条件禁用当前表单项的判定条件
   * @locale.en Condition that disables the current form item based on dependency values
   */
  disableWhenDep: PropStrOrArr<Condition>(),
  // ------------------ validation ------------------
  ...formItemRuleProps,
  /**
   * @locale.zh-CN 根据依赖值条件将当前字段标记为必填的判定条件：all-truthy 全部为真；some-truthy 部分为真；all-falsy 全部为假；some-falsy 部分为假
   * @locale.en Condition that marks the current field as required based on dependency values: all-truthy, some-truthy, all-falsy, some-falsy
   */
  requireWhenDep: PropStrOrArr<Condition>(),
  /**
   * @locale.zh-CN 自定义校验器，可传入单个函数或函数数组
   * @locale.en Custom validators; accepts a single function or an array of functions
   */
  validators: { type: [Array, Function] as PropType<Validator[] | Validator> },
  /**
   * @locale.zh-CN 触发校验的时机，支持 blur、update、depChange、input、change
   * @locale.en Triggers that start validation; supports blur, update, depChange, input, change
   * @default ['blur', 'depChange']
   */
  validateWhen: PropStrOrArr<ValidateTrigger | ValidateTrigger[]>(),
  /**
   * @locale.zh-CN 已存在错误时触发重新校验的时机
   * @locale.en Triggers that re-run validation when an error already exists
   */
  revalidateWhen: PropStrOrArr<ValidateTrigger | ValidateTrigger[]>(),
  /**
   * @locale.zh-CN 手动指定表单项当前的状态，会覆盖根据校验信息推导出的状态
   * @locale.en Manually set the form item's current status, overriding the one derived from validation messages
   */
  status: PropString<Status>(),

  /**
   * @locale.zh-CN 自定义各类校验规则失败时的提示信息，会与 Form 上的同名配置合并
   * @locale.en Custom messages for built-in validation rule failures; merged with the same option on Form
   */
  validateMessages: PropObject<ValidateMessages>(),
});

export const formItemEmits = createEmits<{
  update: unknown;
}>(['update']);

export type FormItemSetupProps = ExtractPropTypes<typeof formItemProps> & CommonProps;
export type FormItemEventProps = GetEventPropsFromEmits<typeof formItemEmits>;
export type FormItemEventMap = GetEventMapFromEmits<typeof formItemEmits>;
export type FormItemProps = Omit<Partial<FormItemSetupProps>, 'elementProps'> &
  FormItemEventProps & {
    elementProps?:
      | object
      | ((param: {
          formContext: CollectorContext<FormProps, FormItemProps, FormProvideExtra> | undefined;
          formItemProps: FormItemSetupProps;
        }) => any);
  };

export type Rule = {
  type?: InputType | DatePanelType;
  min?: string;
  max?: string;
  required?: string;
  greaterThan?: string;
  lessThan?: string;
  label?: string;
  step?: string;
  precision?: string;
  len?: string;
  pattern?: RegExp | string;
};

export type RawRule = {
  type?: InputType | DatePanelType;
  required?: boolean;
  label?: string;
  min?: any;
  max?: any;
  greaterThan?: any;
  lessThan?: any;
  step?: any;
  precision?: any;
  len?: any;
  pattern?: RegExp | string;
};

export type RuleName = keyof Rule;
