export default function () {
  return <>
    {['1', '2', '3', '4'].map(i => <l-button size={i} label={`Size ${i}`} />)}
  </>
}