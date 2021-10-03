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
