export default () => (
  <l-mentions
    value="test@lun update#topic "
    noOptions
    triggers={['@', '#']}
    mentionRenderer={(item, necessaryProps) => (
      <l-tag
        size="1"
        {...necessaryProps}
        // FIXME found that can't focus to end without display: inline
        style="margin-inline: 0.5ch; display: inline;"
        color={item.trigger === '#' ? 'red' : undefined}
      >
        {item.label}
      </l-tag>
    )}
  ></l-mentions>
);
