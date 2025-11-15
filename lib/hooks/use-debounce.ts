/**
 * Custom hook for debouncing a value
 * 
 * Delays updating a value until after a specified delay period has passed
 * since the last change. Useful for reducing API calls or expensive operations
 * triggered by user input.
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds before updating the debounced value (default: 300)
 * @returns The debounced value that updates after the delay period
 * 
 * @example
 * ```typescript
 * const [searchQuery, setSearchQuery] = useState('')
 * const debouncedQuery = useDebounce(searchQuery, 500)
 * 
 * useEffect(() => {
 *   // This will only run after user stops typing for 500ms
 *   performSearch(debouncedQuery)
 * }, [debouncedQuery])
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

