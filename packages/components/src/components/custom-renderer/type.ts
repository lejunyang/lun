import { ExtractPropTypes } from 'vue';

export const customRendererProps = {
  type: { type: String },
  preferHtml: { type: Boolean },
  content: { required: true },
};

export type CustomRendererSetupProps = ExtractPropTypes<typeof customRendererProps>;
export type CustomRendererProps = Partial<CustomRendererSetupProps>;
