import { sentence, text } from 'data';

export default () => (
  <>
    <l-popover content={text} popWidth="anchorWidth">
      <div contenteditable>Edit Me!Pop will sync width with anchor element.</div>
    </l-popover>
    <l-popover content={sentence} popWidth="anchorHeight" popHeight="anchorWidth" anchorName="a" showArrow={true}>
      <textarea rows="4" style="resize: both;">
        Edit Or Resize Me!Pop's width will be textarea's height, and height will be textarea's width.
      </textarea>
    </l-popover>
  </>
);
