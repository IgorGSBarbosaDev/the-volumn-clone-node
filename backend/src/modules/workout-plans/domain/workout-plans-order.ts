export function hasExactIdSet(currentIds: string[], requestedIds: string[]) {
  if (currentIds.length !== requestedIds.length) {
    return false
  }

  const currentSorted = [...currentIds].sort()
  const requestedSorted = [...requestedIds].sort()

  for (let index = 0; index < currentSorted.length; index += 1) {
    if (currentSorted[index] !== requestedSorted[index]) {
      return false
    }
  }

  return new Set(requestedIds).size === requestedIds.length
}
