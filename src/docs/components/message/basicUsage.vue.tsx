export default () => (
  <>
    <l-button
      onClick={() =>
        (document.getElementById('basic') as any)?.open({
          type: 'success',
          duration: null,
          resetDurationOnHover: true,
          message: 'This is a success message',
        })
      }
    >
      show
    </l-button>
    <l-message id="basic"></l-message>
  </>
);
