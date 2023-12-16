export default function () {
  return (
    <>
      {Array(4)
        .fill(0)
        .map((_, i) => (
          <l-popover size={i + 1} content={`Size ${i + 1}`} triggers={'click'}>
            <l-button>Size {i + 1}</l-button>
          </l-popover>
        ))}
    </>
  );
}
