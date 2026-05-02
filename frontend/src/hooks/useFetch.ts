import { useState, useEffect, useCallback } from 'react'

interface State<T> {
  data:    T | null
  loading: boolean
  error:   string | null
}

export function useFetch<T>(
  fetcher: (() => Promise<any>) | null,
  deps:    any[] = [],
) {
  const [state, setState] = useState<State<T>>({ data: null, loading: true, error: null })

  const run = useCallback(async () => {
    if (!fetcher) return
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const data = await fetcher()
      setState({ data, loading: false, error: null })
    } catch (err: any) {
      setState({ data: null, loading: false, error: err.message })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => { run() }, [run])

  return { ...state, refetch: run }
}