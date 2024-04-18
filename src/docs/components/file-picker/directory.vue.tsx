import { filesRenderer } from 'data';

export default () => (
  <>
    <l-file-picker filesRenderer={filesRenderer} directory>
      <l-button>Prefer file Api</l-button>
    </l-file-picker>
    <l-file-picker filesRenderer={filesRenderer} preferFileApi={false} directory>
      <l-button>使用input</l-button>
    </l-file-picker>
  </>
);
