export default () => (
  <l-mentions
    value="test@lun update#topic "
    noOptions
    triggers={['@', '#']}
    onUpdateRaw={e => {
      console.log('update Raw', e.detail);
    }}
    mentionRenderer={(item, necessaryProps) => (
      <l-tag
        size="1"
        {...necessaryProps}
        // found that can't focus to end without display: inline
        // FIXME arrow left/right can't move cursor across span if mentionReadonly
        style="margin-inline: 0.5ch; display: inline;"
        color={item.trigger === '#' ? 'red' : undefined}
      >
        {item.label}
      </l-tag>
    )}
  ></l-mentions>
);
