
import { mentionsEmits, MentionsProps, mentionsProps, defineMentions, iMentions } from '@lun/components';
import createComponent from '../createComponent';

export const LMentions = createComponent<MentionsProps, iMentions>('mentions', defineMentions, mentionsProps, mentionsEmits);
if (__DEV__) LMentions.displayName = 'LMentions';
