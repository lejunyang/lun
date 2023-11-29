export default function () {
  return <>
    <l-button debounce="500" onValidClick={(e) => console.log('debounce click', e)}>防抖 500ms</l-button>
    <l-button throttle="500" onValidClick={(e) => console.log('throttle click', e)}>节流 500ms</l-button>
  </>;
}