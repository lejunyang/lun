export function useNumberKeyBoardEvent(nextStepCallback: () => void, lastStepCallback: () => void) {
  return {
    onKeydown(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') nextStepCallback();
      if (e.key === 'ArrowUp') lastStepCallback();
    },
    onKeyup(e: KeyboardEvent) {
    }
  }
}