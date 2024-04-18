import { filesRenderer } from 'data';

export default () => (
  <>
    <l-file-picker filesRenderer={filesRenderer} onCancel={() => alert('cancel')}>
      <l-button>Prefer file Api</l-button>
    </l-file-picker>
    <l-file-picker filesRenderer={filesRenderer} preferFileApi={false} onCancel={() => alert('cancel')}>
      <l-button>使用input</l-button>
    </l-file-picker>
  </>
);
