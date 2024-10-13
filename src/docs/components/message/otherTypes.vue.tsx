const id1 = 'normal-message',
  id2 = 'teleport-message';
export default () => (
  <>
    <l-message type="normal" id={id1} />
    <l-message type="teleport" id={id2} />
    <l-button onClick={() => (document.getElementById(id1) as any)?.open({ message: id1 })}>{id1}</l-button>
    <l-button onClick={() => (document.getElementById(id2) as any)?.open({ message: id2 })}>{id2}</l-button>
  </>
);
