import { defaultIcons } from '@lun-web/components';
import { objectKeys } from '@lun-web/utils';
import { ref } from 'vue';

const size = ref(18),
  color = ref('var(--l-accent-9)');
export default () => (
  <>
    大小：
    <l-input type="number" v-update={size.value}>
      <div slot="suffix">px</div>
    </l-input>
    颜色：
    <l-input v-update={color.value}></l-input>
    <div class="container">
      {objectKeys(defaultIcons).map((k) => (
        <l-icon name={k} style={{ fontSize: `${size.value}px`, color: color.value }} />
      ))}
    </div>
  </>
);
