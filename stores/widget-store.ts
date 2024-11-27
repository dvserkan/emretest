import { WebWidget } from '@/types/tables'
import { create } from 'zustand'


interface WidgetState {
  widgets: WebWidget[],
  setWidgets: (widgets: WebWidget[]) => void
  addWidget: (widget: WebWidget) => void
}

export const useWidgetStore = create<WidgetState>((set) => ({
  widgets: [],
  setWidgets: (widgets: WebWidget[]) =>
    set(() => ({
        widgets: widgets
    })),
    addWidget: (widget: WebWidget) =>
        set((state) => ({
            widgets: {
                ...state.widgets,
                branches: [...state.widgets, widget]
            }
        })),
}))