import React from 'react'
import type { Badge } from '../../types'

const rarityBorder: Record<string, string> = {
  common:    '#4b5563',
  rare:      '#3b82f6',
  epic:      '#8b5cf6',
  legendary: '#f59e0b',
}

interface Props { badge: Badge; size?: 'sm' | 'md' | 'lg'; showLabel?: boolean }

export function BadgeChip({ badge, size = 'md', showLabel = true }: Props) {
  const sz = size === 'sm' ? 28 : size === 'lg' ? 52 : 38
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{
        width: sz, height: sz, borderRadius: '50%',
        border: `2px solid ${rarityBorder[badge.rarity] || '#4b5563'}`,
        background: `${badge.color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: sz * 0.45,
        boxShadow: `0 0 10px ${badge.color}44`
      }}>
        {badge.icon}
      </div>
      {showLabel && (
        <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', textAlign: 'center', maxWidth: 60 }}>
          {badge.name}
        </span>
      )}
    </div>
  )
}
