import { ExtractPropTypes } from 'vue';

export const customRendererProps = {
  type: { type: String },
  content: { required: true },
};

export type CustomRendererProps = ExtractPropTypes<typeof customRendererProps>;
