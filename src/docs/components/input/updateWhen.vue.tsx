import { ref } from 'vue';

const input = ref('111');
const mul = ref(['1']);
export default () => {
  return (
    <>
      <div>
        updateWhen="input" <l-input v-update={input.value} updateWhen="input" />
      </div>
      <div>
        updateWhen="not-composing" <l-input v-update={input.value} updateWhen="not-composing" />
      </div>
      <div>
        updateWhen="change" <l-input v-update={input.value} updateWhen="change" />
      </div>
      <pre style="flex-basis: 100%">value: {input.value}</pre>
      <div>
        updateWhen="input" <l-input v-update={mul.value} updateWhen="input" multiple />
      </div>
      <div>
        updateWhen="not-composing" <l-input v-update={mul.value} updateWhen="not-composing" multiple />
      </div>
      <div>
        updateWhen="change" <l-input v-update={mul.value} updateWhen="change" multiple />
      </div>
      <pre style="flex-basis: 100%">multiple values: {JSON.stringify(mul.value)}</pre>
    </>
  );
};
