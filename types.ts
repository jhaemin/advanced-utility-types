import type { DeepOmit } from 'ts-essentials'

/**
 * { a: { b: { c: string } } }
 *
 * -> 'a', 'a.b', 'a.b.c'
 */
type RecursiveKeyOf<Obj extends Record<string, any>> = {
  [Key in keyof Obj & (string | number)]: Obj[Key] extends Array<any>
    ? `${Key}`
    : Obj[Key] extends Record<string, any>
    ? `${Key}` | `${Key}.${RecursiveKeyOf<Obj[Key]>}`
    : `${Key}`
}[keyof Obj & (string | number)]

/**
 * Make all nested object properties optional
 */
type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P]
}

type RecursiveObject<T> = T extends Date ? never : T extends object ? T : never

/**
 * Change all the nested properties of an object to string
 */
type StringValues<TModel> = {
  [Key in keyof TModel]?: TModel[Key] extends RecursiveObject<TModel[Key]>
    ? StringValues<TModel[Key]>
    : string // Change this type whatever you want
}

/**
 * 'a.b.c' -> ['a', 'b', 'c']
 */
type Split<
  Str,
  Cache extends string[] = []
> = Str extends `${infer Method}.${infer Rest}`
  ? Split<Rest, [...Cache, Method]>
  : Str extends `${infer Last}`
  ? [...Cache, Last]
  : never

/**
 * Find object value from ['a', 'b', 'c', ...]
 */
type ValueByKeyPathArr<Obj, KeyPathArr> = KeyPathArr extends [
  infer ObjKey,
  infer Rest
]
  ? ObjKey extends keyof Obj
    ? ValueByKeyPathArr<Obj[ObjKey], [Rest]>
    : never
  : KeyPathArr extends [infer ObjKey]
  ? ObjKey extends keyof Obj
    ? Obj[ObjKey]
    : never
  : never

/**
 * Find object value from 'a.b.c...'
 */
type ValueByKeyPathStr<Obj, Str> = Str extends string
  ? ValueByKeyPathArr<Obj, Split<Str>>
  : never

/**
 * Only allow just one type from union of string
 * as an object's key.
 *
 * Example
 * type Key = 'cherry' | 'pie'
 *
 * const obj: UniqueKey<Key> = {
 *   cherry: '',    <- not allowed
 *   pie: '',       <- not allowed
 * }
 *
 * // Allowed
 * const obj: UniqueKey<Key> = {
 *   cherry: '',
 * }
 *
 * // Allowed
 * const obj: UniqueKey<Key> = {
 *   pie: '',
 * }
 */
type UniqueKey<Key extends string, Value = any> = {
  [P in Key]: Record<P, Value> & Partial<Record<Exclude<Key, P>, never>>
}[Key]

/**
 * Exclude nested
 */
type DifferenceWithNever<A, B> = {
  [K in keyof A]: K extends keyof B
    ? A[K] extends object
      ? B[K] extends object
        ? DifferenceWithNever<A[K], B[K]>
        : A[K]
      : A[K] extends B[K]
      ? never
      : A[K]
    : A[K]
}

/**
 * Extract a union of key string with the given type.
 * ex)
 * ExtractKeyOfType<{
 *   hello: string
 *   world: number
 *   bye: string
 * }, string>
 * -> 'hello' | 'bye'
 */
type ExtractKeyOfType<Obj, T> = Obj extends object
  ? keyof Obj extends infer Key
    ? Key extends keyof Obj
      ? Obj[Key] extends T
        ? Key extends string
          ? Key
          : never
        : never
      : never
    : never
  : never

/**
 * Opposite of ExtractKeyOfType.
 * ex)
 * ExcludeKeyOfType<{
 *   hello: string
 *   world: number
 *   bye: string
 * }, string>
 * -> 'world'
 */
type ExcludeKeyOfType<Obj, T> = Obj extends object
  ? keyof Obj extends infer Key
    ? Key extends keyof Obj
      ? Obj[Key] extends T
        ? never
        : Key extends string
        ? Key
        : never
      : never
    : never
  : never

/**
 * Make a sub-record with the given union of keys.
 * ex)
 * SubObject<{ hello: string, world: number }, 'hello'> -> { hello: string }
 */
type SubObject<Obj extends object, Key extends keyof Obj> = {
  [K in Key]: Obj[K]
}

/**
 * Omit object properties with the given type.
 * ex)
 * OmitType<{ hello: string, world: number }, string> -> { world: number }
 */
type OmitType<Obj extends object, T> = SubObject<Obj, ExcludeKeyOfType<Obj, T>>

/**
 * Nested version of OmitType.
 */
type DeepOmitType<Obj, T, OmittedObj = Omit<Obj, ExtractKeyOfType<Obj, T>>> = {
  [K in keyof OmittedObj]: OmittedObj[K] extends object
    ? DeepOmitType<OmittedObj[K], T>
    : OmittedObj[K]
}

/**
 * Get difference object type between two nested object types.
 */
type Diff<A, B> = DeepOmitType<DifferenceWithNever<A, B>, never>

type A = {
  hello: string
  good?: string
  okay?: number
  world?: {
    my: number
    name: number
    is: number
  }
}

type B = {
  good?: string
  world?: {
    is: number
  }
}

const a: DeepOmitType<A, string> = {}

const diff: Diff<A, B> = {
  hello: '',
  world: {
    my: 1,
    name: 2,
  },
}
