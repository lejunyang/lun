import { text } from 'data';

export default () => (
  <l-theme-provider loading>
    <l-skeleton style="width: 100%; height: 20px;"></l-skeleton>
    <l-skeleton radius="full" style="width: 100px; height: 100px;"></l-skeleton>
    <l-skeleton radius="large" style="width: 80px; height: 80px;"></l-skeleton>
    <l-skeleton>{text}</l-skeleton>
    <l-skeleton loading={false}>loading false</l-skeleton>
  </l-theme-provider>
);
