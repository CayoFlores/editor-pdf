export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface Bounds {
  width: number
  height: number
}

export type ResizeCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

const MIN_SIZE = 20
const DRAG_THRESHOLD = 4

function clampToBounds(rect: Rect, bounds: Bounds): Rect {
  const width = Math.min(Math.max(rect.width, MIN_SIZE), bounds.width)
  const height = Math.min(Math.max(rect.height, MIN_SIZE), bounds.height)
  const x = Math.min(Math.max(rect.x, 0), Math.max(bounds.width - width, 0))
  const y = Math.min(Math.max(rect.y, 0), Math.max(bounds.height - height, 0))
  return { x, y, width, height }
}

export function useDragResize(
  getRect: () => Rect,
  setRect: (rect: Rect) => void,
  getBounds: () => Bounds,
) {
  function startDrag(event: PointerEvent) {
    const startRect = getRect()
    const startX = event.clientX
    const startY = event.clientY
    let dragging = false

    function onMove(moveEvent: PointerEvent) {
      const dx = moveEvent.clientX - startX
      const dy = moveEvent.clientY - startY

      if (!dragging) {
        if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return
        dragging = true
      }

      moveEvent.preventDefault()
      setRect(
        clampToBounds(
          { ...startRect, x: startRect.x + dx, y: startRect.y + dy },
          getBounds(),
        ),
      )
    }

    function onUp() {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  function startResize(corner: ResizeCorner, event: PointerEvent) {
    event.preventDefault()
    event.stopPropagation()

    const startRect = getRect()
    const startX = event.clientX
    const startY = event.clientY

    const anchor = {
      x: corner.includes('left') ? startRect.x + startRect.width : startRect.x,
      y: corner.includes('top') ? startRect.y + startRect.height : startRect.y,
    }

    function onMove(moveEvent: PointerEvent) {
      moveEvent.preventDefault()
      const dx = moveEvent.clientX - startX
      const dy = moveEvent.clientY - startY

      const draggedCorner = {
        x: (corner.includes('left') ? startRect.x : startRect.x + startRect.width) + dx,
        y: (corner.includes('top') ? startRect.y : startRect.y + startRect.height) + dy,
      }

      const width = Math.max(MIN_SIZE, Math.abs(draggedCorner.x - anchor.x))
      const height = Math.max(MIN_SIZE, Math.abs(draggedCorner.y - anchor.y))

      const x = corner.includes('left') ? anchor.x - width : anchor.x
      const y = corner.includes('top') ? anchor.y - height : anchor.y

      setRect(clampToBounds({ x, y, width, height }, getBounds()))
    }

    function onUp() {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return { startDrag, startResize }
}
