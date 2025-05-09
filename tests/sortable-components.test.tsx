"use client"

import type React from "react"

import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { SortableContainer } from "@/components/sortable/sortable-context"
import { SortableItem } from "@/components/sortable/sortable-item"

// モックの設定
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div data-testid="dnd-context">{children}</div>,
  useSensor: () => ({}),
  useSensors: () => ({}),
  PointerSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
  closestCenter: vi.fn(),
}))

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sortable-context">{children}</div>
  ),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  sortableKeyboardCoordinates: vi.fn(),
  verticalListSortingStrategy: {},
}))

vi.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: vi.fn(() => ""),
    },
  },
}))

vi.mock("@dnd-kit/modifiers", () => ({
  restrictToVerticalAxis: {},
}))

describe("Sortable Components", () => {
  it("renders SortableContainer with children", () => {
    const handleDragEnd = vi.fn()

    render(
      <SortableContainer items={["item1", "item2"]} onDragEnd={handleDragEnd}>
        <div data-testid="test-child">Test Child</div>
      </SortableContainer>,
    )

    expect(screen.getByTestId("dnd-context")).toBeInTheDocument()
    expect(screen.getByTestId("sortable-context")).toBeInTheDocument()
    expect(screen.getByTestId("test-child")).toBeInTheDocument()
  })

  it("renders SortableItem with children", () => {
    render(
      <SortableItem id="test-id">
        <div data-testid="item-content">Item Content</div>
      </SortableItem>,
    )

    expect(screen.getByTestId("item-content")).toBeInTheDocument()
  })
})
