import React, { useState, useMemo } from 'react'

export interface Column<T> {
  key:       keyof T | string
  header:    string
  sortable?: boolean
  render?:   (row: T) => React.ReactNode
  align?:    'left' | 'right' | 'center'
}

interface Props<T> {
  columns:    Column<T>[]
  data:       T[]
  keyField:   keyof T
  searchKey?: keyof T
}

export function DataTable<T extends Record<string, any>>({
  columns, data, keyField, searchKey,
}: Props<T>) {
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [search,  setSearch]  = useState('')

  const filtered = useMemo(() => {
    let rows = [...data]
    if (search && searchKey) {
      rows = rows.filter(r =>
        String(r[searchKey]).toLowerCase().includes(search.toLowerCase())
      )
    }
    if (sortCol) {
      rows.sort((a, b) => {
        const av = a[sortCol], bv = b[sortCol]
        if (av === bv) return 0
        const cmp = av < bv ? -1 : 1
        return sortDir === 'asc' ? cmp : -cmp
      })
    }
    return rows
  }, [data, search, sortCol, sortDir, searchKey])

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('desc') }
  }

  return (
    <div>
      {searchKey && (
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          style={{
            width: '100%', marginBottom: 12,
            padding: '7px 12px',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-sm)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            outline: 'none',
          }}
        />
      )}
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%', borderCollapse: 'collapse',
          fontSize: '0.8rem', fontFamily: 'var(--font-mono)',
        }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  onClick={() => col.sortable && toggleSort(String(col.key))}
                  style={{
                    padding: '8px 12px',
                    textAlign: col.align || 'left',
                    fontWeight: 400,
                    letterSpacing: '0.08em',
                    fontSize: '0.68rem',
                    textTransform: 'uppercase',
                    cursor: col.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                    color: sortCol === String(col.key) ? 'var(--accent)' : 'var(--text-muted)',
                  }}
                >
                  {col.header}
                  {col.sortable && sortCol === String(col.key) && (
                    <span style={{ marginLeft: 4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr
                key={String(row[keyField])}
                style={{
                  borderBottom: '1px solid var(--border)',
                  transition: 'background 0.15s',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.012)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.012)')}
              >
                {columns.map(col => (
                  <td
                    key={String(col.key)}
                    style={{
                      padding: '9px 12px',
                      textAlign: col.align || 'left',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {col.render
                      ? col.render(row)
                      : String(row[String(col.key)] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p style={{
            textAlign: 'center', color: 'var(--text-muted)',
            padding: '2rem', fontSize: '0.8rem',
          }}>
            No results found
          </p>
        )}
      </div>
    </div>
  )
}
