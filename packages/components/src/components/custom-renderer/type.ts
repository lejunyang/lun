import { freeze, TryGet } from '@lun-web/utils';
import { GetEventPropsFromEmits, PropBoolean, PropString } from 'common';
import { ExtractPropTypes, h } from 'vue';

export interface UserRegistry {
  // renderer: 'react'
}

export type CustomRendererType = 'vnode' | 'html' | 'text' | TryGet<UserRegistry, 'renderer'> | (string & {});

export const customRendererProps = freeze({
  type: PropString<CustomRendererType>(),
  preferHtml: PropBoolean(),
  content: { required: true },
});

export const customRendererEmits = freeze({});

type Raw = string | number | boolean | object;
export type CustomRendererSource = {
  content: Raw | ((param: { h: typeof h }) => Raw);
  type?: CustomRendererType;
  preferHtml?: boolean;
} & Record<string, unknown>;

export type GetCustomRendererSource<T extends any[] = never, FuncOnly extends boolean = false> = FuncOnly extends true
  ? (...params: T) => CustomRendererSource
  : Raw | CustomRendererSource | (T extends any[] ? (...params: T) => CustomRendererSource : never);

export type CustomRendererSetupProps = ExtractPropTypes<typeof customRendererProps> & Record<string, any>;
export type CustomRendererEvents = GetEventPropsFromEmits<typeof customRendererEmits>;
export type CustomRendererProps = Partial<CustomRendererSetupProps> & CustomRendererEvents;
