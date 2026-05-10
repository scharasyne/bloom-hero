"use client"

type CategoryOption = {
  id: string
  category_name: string
}

type CategoryPillSelectorProps = {
  categories: CategoryOption[]
  selectedIds: string[]
  onChange: (nextIds: string[]) => void
  disabled?: boolean
  maxSelected?: number
}

export function CategoryPillSelector({
  categories,
  selectedIds,
  onChange,
  disabled = false,
  maxSelected = 3,
}: CategoryPillSelectorProps) {
  const selectedCount = selectedIds.length

  if (categories.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[#ddd8d2] bg-[#faf9f7] px-4 py-3 text-sm text-[#8a847d]">
        No categories are available yet.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = selectedIds.includes(category.id)
          const canSelectMore = isSelected || selectedCount < maxSelected

          return (
            <button
              key={category.id}
              type="button"
              disabled={disabled || (!isSelected && !canSelectMore)}
              aria-pressed={isSelected}
              onClick={() => {
                if (disabled) {
                  return
                }

                if (isSelected) {
                  onChange(selectedIds.filter((id) => id !== category.id))
                  return
                }

                if (selectedCount >= maxSelected) {
                  return
                }

                onChange([...selectedIds, category.id])
              }}
              className={[
                "inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                isSelected
                  ? "border-[#2f5d3a] bg-[#2f5d3a] text-white shadow-sm"
                  : "border-[#ddd8d2] bg-white text-[#5f5a54] hover:border-[#bfb6ad] hover:bg-[#f7f4ef]",
                disabled || (!isSelected && !canSelectMore)
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer",
              ].join(" ")}
            >
              {category.category_name}
            </button>
          )
        })}
      </div>

      <p className="text-xs text-[#8a847d]">
        Select between 1 and {maxSelected} categories. {selectedCount}/{maxSelected} selected.
      </p>
    </div>
  )
}