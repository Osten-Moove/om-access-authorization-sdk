export function compareObject<T>(a: T, b: T): Partial<T> | undefined {
  const keys1 = Object.keys(a)
  const modifiedKeys = keys1.filter((key) => a[key] !== b[key] || key === 'id')
  if (modifiedKeys.length > 1) return modifiedKeys.reduce((acc, key) => ({ ...acc, [key]: a[key] }), {})
}

export function compareArrays<T>(a: Array<T>, b: Array<T>, func: (it: T, c: Array<T>) => boolean) {
  const intersection = a.filter((element) => func(element, b))
  const onlyInA = a.filter((element) => !func(element, b))
  const onlyInB = b.filter((element) => !func(element, a))

  const intersectionB = b.filter((element) => func(element, intersection))
  const update = Array<Partial<T>>()
  intersection.forEach((a, index) => {
    update.push(compareObject(a, intersectionB[index]))
  })

  return {
    intersection,
    onlyInA,
    onlyInB,
    update: update.filter((it) => it),
  }
}
