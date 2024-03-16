import { UseInputOptions, useInput } from "../input";

export type UseMentionsOptions = UseInputOptions;

export function useMentions(options: UseMentionsOptions) {
  const input = useInput(options);
}