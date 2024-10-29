import { ref } from 'vue';

const name = ref(['far-bell', 'fas-archive', 'fab-apple']),
  size = ref(18),
  color = ref('var(--l-accent-9)');
export default () => (
  <>
    大小：
    <l-input type="number" v-update={size.value}>
      <div slot="suffix">px</div>
    </l-input>
    颜色：
    <l-input v-update={color.value}></l-input>
    <div>
      names： <l-input v-update={name.value} multiple />
    </div>
    <div class="container">
      {name.value.map((n) => (
        <l-icon name={n} library="font-awesome" style={{ fontSize: `${size.value}px`, color: color.value }} />
      ))}
    </div>
  </>
);
