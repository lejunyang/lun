import { ExtractPropTypes } from 'vue';

export const customRendererProps = {
  type: { type: String },
  preferHtml: { type: Boolean },
  content: { required: true },
};

export type CustomRendererProps = ExtractPropTypes<typeof customRendererProps>;
