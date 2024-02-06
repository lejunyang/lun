const open = (e: any) => {
  const el = e.target;
  const placement = el.dataset.placement;
  if (!placement) return;
  (document.getElementById(placement) as any)?.open({
    type: 'success',
    message: 'This is a message',
  });
};
const placements = ['top-start', 'top', 'top-end', 'left', 'center', 'right', 'bottom-start', 'bottom', 'bottom-end'];

export default function () {
  return (
    <div style="width: 100%" onClick={open}>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; row-gap: 10px;">
        {placements.map((placement) => (
          <l-button data-placement={placement} style="justify-self: center;">
            {placement}
          </l-button>
        ))}
      </div>
      {placements.map((placement) => (
        <l-message id={placement} placement={placement}></l-message>
      ))}
    </div>
  );
}
