import { ref } from 'vue';

const multi = ref(['1', '2', '3']);

export default function () {
  return (
    <>
      <div>
        maxTags=4
        <l-input
          multiple
          value={multi.value}
          placeholder="placeholder"
          maxTags={4}
          onUpdate={(e) => {
            console.log('e', e);
            multi.value = e.detail;
          }}
        />
      </div>
      <div>
        disabled: <l-input multiple value={multi.value} disabled placeholder="placeholder" />
      </div>
      <div>
        readonly: <l-input multiple value={multi.value} readonly placeholder="placeholder" />
      </div>
      <div>
        wrapTags: <l-input multiple value={Array(20).fill(1)} wrapTags />
      </div>
      <div style="width: 100%">
        wrapTags=false: <l-input multiple value={Array(20).fill(1)} wrapTags={false} />
      </div>
    </>
  );
}
