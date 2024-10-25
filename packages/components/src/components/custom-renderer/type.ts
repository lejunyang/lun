import { freeze } from '@lun/utils';
import { GetEventPropsFromEmits, PropBoolean, PropString } from 'common';
import { ExtractPropTypes, h } from 'vue';

export const customRendererProps = freeze({
  type: PropString(),
  preferHtml: PropBoolean(),
  content: { required: true },
});

export const customRendererEmits = freeze({});

type Raw = string | number | boolean | object;
export type CustomRendererSource = {
  content: Raw | ((param: { h: typeof h }) => Raw);
  type?: string;
  preferHtml?: boolean;
} & Record<string, unknown>;

export type GetCustomRendererSource<T extends any[] = never> =
  | Raw
  | CustomRendererSource
  | (T extends any[] ? (...params: T) => CustomRendererSource : never);

export type CustomRendererSetupProps = ExtractPropTypes<typeof customRendererProps> & Record<string, any>;
export type CustomRendererEvents = GetEventPropsFromEmits<typeof customRendererEmits>;
export type CustomRendererProps = Partial<CustomRendererSetupProps> & CustomRendererEvents;
