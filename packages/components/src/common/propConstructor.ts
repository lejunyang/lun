import { AnyFn } from "@lun/utils";
import { PropType } from "vue";

export function PropString<T extends string>() {
  return { type: String as unknown as PropType<T> };
}

export function PropNumber<T extends number>() {
  return { type: Number as unknown as PropType<T> };
}

export function PropBoolean<T extends boolean>() {
  return { type: Boolean as unknown as PropType<T> };
}

export function PropObject<T extends {}>() {
  return { type: Object as unknown as PropType<T> };
}

export function PropArray<T extends any[]>() {
  return { type: Array as unknown as PropType<T> };
}

export function PropFunction<T extends AnyFn>() {
  return { type: Function as unknown as PropType<T> };
}

export function PropObjOrFunc<T extends {} | AnyFn>() {
  return { type: [Object, Function] as unknown as PropType<T> };
}

export function PropObjOrStr<T extends string | {}>() {
  return { type: [String, Object] as unknown as PropType<T> };
}