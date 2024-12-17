import { defineMentions, MentionsProps, iMentions } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LMentions = createComponent<MentionsProps, iMentions>('mentions', defineMentions);
if (__DEV__) LMentions.displayName = 'LMentions';
