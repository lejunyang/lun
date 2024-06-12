export default () => (
  <>
    <l-range value={20} labels={{ start: '0%', 30: '30%', 100: '100%' }}></l-range>
    <l-range value={30} type="vertical" labels={{ 10: '10%', 40: '40%', end: '100%' }} style="height: 200px"></l-range>
  </>
);
