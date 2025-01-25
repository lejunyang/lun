export default () => (
  <>
    <l-pagination
      class="w-full"
      total={98}
      pageSize={10}
      controls={[
        ({ total, current, pageSize }) => `共 ${total} 条，每页 ${pageSize} 条，当前第 ${current} 页`,
        'prev',
        'pages',
        'next',
      ]}
    />
  </>
);
