import { isArray } from "../is";

export function isEnterDown(e: Event) {
	return e.type === 'keydown' && (e as KeyboardEvent).key === 'Enter';
}

export function isNoBasicModifierKey(e: KeyboardEvent) {
	return !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey;
}

/**
 * determine whether a key composition has been entered down
 * @param e KeyDown Event
 * @param keyPattern A string or string array representing a key composition pattern, for example `Ctrl + Alt + A`
 * Modifiers and keys are case-insensitive. Both `ctrl` and `control` represent the control key, `shift` represents the shift key and `alt` represents the alt key.
 * `meta`, `win`, `cmd`, `windows` and `command`, they all represent the meta key, which is Win in windows and Command in mac.
 * @returns `undefined` if it's not keydown event, otherwise `boolean`
 */
export function isKeyCompositionDown(e: KeyboardEvent, keyPattern: string | string[]) {
	if (e.type !== 'keydown') return;
	const keySplits = isArray(keyPattern) ? keyPattern : keyPattern.split('+');
	let result = true;
	for (const k of keySplits) {
    if (!k) continue;
    const finalK = String(k).trim().toLowerCase();
    if (!finalK) continue;
    if (['ctrl', 'control'].includes(finalK)) result &&= e.ctrlKey;
    else if (finalK === 'shift') result &&= e.shiftKey;
    else if (finalK === 'alt') result &&= e.altKey;
    else if (['meta', 'win', 'cmd', 'windows', 'command'].includes(finalK)) result &&= e.metaKey;
    else result &&= finalK === e.key;
    if (!result) break;
  }
	return result;
}
