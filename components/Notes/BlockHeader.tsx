'use client'

import React, { useState, useEffect, useRef } from 'react'

interface BlockHeaderProps {
  value: string
  onChange: (value: string) => void
}

export function BlockHeader({ value, onChange }: BlockHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    setIsEditing(false)
    if (localValue.trim()) {
      onChange(localValue.trim())
    } else {
      // Reset to original or default
      setLocalValue(value || 'New block header name')
      onChange(value || 'New block header name')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setLocalValue(value)
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="
          text-lg font-semibold w-full 
          border-b-2 border-blue-500 
          focus:outline-none
          bg-transparent
          text-gray-800
          px-1
        "
        placeholder="Enter block header..."
      />
    )
  }

  return (
    <h3 
      onClick={() => setIsEditing(true)}
      className="
        text-lg font-semibold 
        cursor-pointer 
        hover:text-blue-600 
        transition-colors
        text-gray-800
        px-1
        border-b-2 border-transparent
        hover:border-gray-200
      "
      title="Click to edit header"
    >
      {value || 'New block header name'}
    </h3>
  )
}
