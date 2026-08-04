import { defineStore } from 'pinia'
import { computed, markRaw, ref } from 'vue'
import type { Command } from '@/commands/types'

export interface HistoryEntry {
  index: number
  label: string
}

export const useHistoryStore = defineStore('history', () => {
  const undoStack = ref<Command[]>([])
  const redoStack = ref<Command[]>([])

  const canUndo = computed(() => undoStack.value.length > 0)
  const canRedo = computed(() => redoStack.value.length > 0)

  /** Position in the timeline: 0 = initial state, N = N commands applied. */
  const currentIndex = computed(() => undoStack.value.length)

  /** Full chronological list of commands, applied or currently undone. */
  const timeline = computed<HistoryEntry[]>(() => {
    const future = [...redoStack.value].reverse()
    return [...undoStack.value, ...future].map((command, i) => ({
      index: i + 1,
      label: command.label,
    }))
  })

  function execute(command: Command) {
    command.execute()
    undoStack.value.push(markRaw(command))
    redoStack.value = []
  }

  function undo() {
    const command = undoStack.value.pop()
    if (!command) return
    command.undo()
    redoStack.value.push(command)
  }

  function redo() {
    const command = redoStack.value.pop()
    if (!command) return
    command.execute()
    undoStack.value.push(command)
  }

  /** Jump straight to a point in the timeline (0 = initial state). */
  function goTo(index: number) {
    const target = Math.max(0, Math.min(index, undoStack.value.length + redoStack.value.length))
    while (undoStack.value.length > target) undo()
    while (undoStack.value.length < target) redo()
  }

  function clear() {
    undoStack.value = []
    redoStack.value = []
  }

  return { canUndo, canRedo, currentIndex, timeline, execute, undo, redo, goTo, clear }
})
