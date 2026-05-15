// components/Modal.tsx
"use client"

import { type ReactNode } from "react"


type ModalProps = {
  isOpen: boolean
  onCloseAction: () => void
  children: ReactNode
}

export function Modal({ isOpen, onCloseAction, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onCloseAction} // click backdrop to close
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl"
        onClick={e => e.stopPropagation()} // prevent close when clicking inside
      >
        <button onClick={onCloseAction} className="float-right text-gray-400 hover:text-gray-600">
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}