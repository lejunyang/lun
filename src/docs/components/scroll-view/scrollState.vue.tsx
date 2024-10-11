import { ref } from 'vue';

const animation = {
  enterAnimation: [
    [{ opacity: 0 }, { opacity: 1 }],
    {
      duration: 500,
    },
  ],
  leaveAnimation: [
    [{ opacity: 1 }, { opacity: 0 }],
    {
      duration: 500,
    },
  ],
};
const view = ref<HTMLElement>();
export default () => (
  <div class="w-full" style="height: 300px; transform: translate(0,0)">
    <l-scroll-view
      ref={view}
      class="w-full"
      style="position: relative; height: 300px;"
      getSlots={(state) => {
        return [
          {
            show: !state.yForward,
            name: 'not-forward',
            ...animation,
          },
          {
            show: state.scrollY > 10,
            name: 'to-top',
            ...animation,
          },
        ];
      }}
    >
      <header class="w-full" style="position: fixed; top: 0; background: var(--l-accent-a5);" slot="not-forward">
        Header
      </header>
      <div class="w-full" style="height: 1000px;"></div>
      <l-button
        slot="to-top"
        style="position: fixed; bottom: 10px; right: 10px;"
        onClick={() => view.value.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        Top
      </l-button>
      <footer class="w-full" style="position: fixed; bottom: 0; background: var(--l-accent-a5);" slot="not-forward">
        Footer
      </footer>
    </l-scroll-view>
  </div>
);
