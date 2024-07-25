import { freeze } from '@lun/utils';
import { GetEventPropsFromEmits, PropBoolean, PropString } from 'common';
import { ExtractPropTypes } from 'vue';

export const customRendererProps = freeze({
  type: PropString(),
  preferHtml: PropBoolean(),
  content: { required: true },
});

export const customRendererEmits = freeze({});

export type CustomRendererSource = {
  content: unknown;
  type?: string;
  preferHtml?: boolean;
} & Record<string, unknown>;

export type CustomRendererSetupProps = ExtractPropTypes<typeof customRendererProps> & Record<string, any>;
export type CustomRendererEvents = GetEventPropsFromEmits<typeof customRendererEmits>;
export type CustomRendererProps = Partial<CustomRendererSetupProps> & CustomRendererEvents;
