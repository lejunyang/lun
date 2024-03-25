import { PropBoolean, PropString } from 'common';
import { ExtractPropTypes } from 'vue';

export const customRendererProps = {
  type: PropString(),
  preferHtml: PropBoolean(),
  content: { required: true },
};

export type CustomRendererSetupProps = ExtractPropTypes<typeof customRendererProps> & Record<string, any>;
export type CustomRendererProps = Partial<CustomRendererSetupProps>;
