"use client"

import { useState, useEffect } from "react"
import { fetchData, type QueryOptions } from "./operations"

/**
 * Supabaseからデータを取得するためのフック
 */
export function useSupabaseQuery<T = any>(
  tableName: string,
  options: Omit<QueryOptions, "clientType"> = {},
  dependencies: any[] = [],
) {
  const [data, setData] = useState<T[]>([])
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        setLoading(true)
        const result = await fetchData<T>(tableName, {
          ...options,
          clientType: "client",
        })

        if (isMounted) {
          setData(result.data)
          setCount(result.count)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [...dependencies])

  return { data, count, loading, error }
}

/**
 * 単一のレコードを取得するためのフック
 */
export function useSupabaseRecord<T = any>(
  tableName: string,
  id: string | null,
  options: Omit<QueryOptions, "clientType" | "filters"> = {},
  dependencies: any[] = [],
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      if (!id) {
        setData(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const result = await fetchData<T>(tableName, {
          ...options,
          filters: { id },
          clientType: "client",
        })

        if (isMounted) {
          setData(result.data.length > 0 ? result.data[0] : null)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [id, tableName, ...dependencies])

  return { data, loading, error }
}
