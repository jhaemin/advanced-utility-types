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
type Difference<A, B> = {
  [K in keyof A]: K extends keyof B
    ? A[K] extends object
      ? B[K] extends object
        ? Difference<A[K], B[K]>
        : A[K]
      : A[K] extends B[K]
      ? never
      : A[K]
    : A[K]
}

type Diff<A, B> = {
  [K in Exclude<keyof A, 'hello'>]: A[K]
}

type DDD = {
  a: never
}

type DDK = keyof DDD

type NN = '1' | '2' | '3'
type ND = {
  '1': string
  '2': number
  '3': boolean
}

// type NNN<O extends object, T extends keyof O> = T extends infer TT ? TT extends keyof O ? O[TT] extends infer OT
//   ? OT extends string
//     ? never
//     : Record<T, OT>
//   : never : never : never

type ExtractOnlyTheKeysOfSpecificType<
  Obj extends object,
  T
> = keyof Obj extends infer Key
  ? Key extends keyof Obj
    ? Obj[Key] extends T
      ? never
      : Key
    : never
  : never

type SubObject<Obj extends object, Key extends keyof Obj> = {
  [K in Key]: Obj[K]
}

type OmitType<Obj extends object, T> = SubObject<
  Obj,
  ExtractOnlyTheKeysOfSpecificType<Obj, T>
>

type A = {
  hello: string
  world?: {
    my: number
    name: number
    is: number
  }
}

type B = {
  hello: string
  world: {
    is: number
  }
}

const diff: OmitType<Difference<A, B>, never> = {}

// const diff: DeepOmit<A, { hello: never }> = {
//   world: {
//     my: 3,
//     name: 3,
//   },
// }
