const id1 = 'fixed-message',
  id2 = 'teleport-message';
export default () => (
  <>
    <l-message type="fixed" id={id1} duration="none" />
    <l-message type="teleport" id={id2} duration="none" />
    <l-button onClick={() => (document.getElementById(id1) as any)?.open({ message: id1 })}>{id1}</l-button>
    <l-button onClick={() => (document.getElementById(id2) as any)?.open({ message: id2 })}>{id2}</l-button>
  </>
);
