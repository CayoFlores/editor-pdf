import { useEditorStore, type PageElement } from '@/stores/editor'
import type { Command } from './types'

type ElementType = PageElement['type']

function elementKind(type: ElementType): string {
  return type === 'text' ? 'caja de texto' : 'imagen'
}

function describeUpdate(
  elementType: ElementType,
  before: Partial<PageElement>,
  after: Partial<PageElement>,
): string {
  const kind = elementKind(elementType)

  if ('width' in after && 'height' in after && 'x' in after && 'y' in after) {
    const moved = before.x !== after.x || before.y !== after.y
    const resized = before.width !== after.width || before.height !== after.height
    if (moved && resized) return `Mover y redimensionar ${kind}`
    if (resized) return `Redimensionar ${kind}`
    return `Mover ${kind}`
  }

  if ('content' in after) return 'Editar texto'
  if ('fontFamily' in after) return 'Cambiar fuente'
  if ('fontSize' in after) return 'Cambiar tamaño de fuente'
  if ('color' in after) return 'Cambiar color de texto'
  if ('bold' in after) return 'Cambiar negrita'
  if ('italic' in after) return 'Cambiar cursiva'
  if ('underline' in after) return 'Cambiar subrayado'
  if ('align' in after) return 'Cambiar alineación'
  return `Editar ${kind}`
}

export class AddElementCommand implements Command {
  readonly label: string

  constructor(
    private page: number,
    private element: PageElement,
  ) {
    this.label = `Insertar ${elementKind(element.type)}`
  }

  execute() {
    const store = useEditorStore()
    store.insertElement(this.page, this.element)
    store.selectElement(this.element.id)
  }

  undo() {
    const store = useEditorStore()
    store.deleteElement(this.page, this.element.id)
  }
}

export class DeleteElementCommand implements Command {
  readonly label: string
  private index = 0

  constructor(
    private page: number,
    private element: PageElement,
  ) {
    this.label = `Eliminar ${elementKind(element.type)}`
  }

  execute() {
    const store = useEditorStore()
    this.index = store.elementIndex(this.page, this.element.id)
    store.deleteElement(this.page, this.element.id)
  }

  undo() {
    const store = useEditorStore()
    store.insertElement(this.page, this.element, this.index)
    store.selectElement(this.element.id)
  }
}

export class UpdateElementCommand implements Command {
  readonly label: string

  constructor(
    private page: number,
    private id: string,
    elementType: ElementType,
    private before: Partial<PageElement>,
    private after: Partial<PageElement>,
  ) {
    this.label = describeUpdate(elementType, before, after)
  }

  execute() {
    useEditorStore().patchElement(this.page, this.id, this.after)
  }

  undo() {
    useEditorStore().patchElement(this.page, this.id, this.before)
  }
}
