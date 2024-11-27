import { WebWidgetData } from '@/types/tables'
import { create } from 'zustand'

interface WebWidgetDataState {
    widgetDatas: WebWidgetData[],
    setWidgetDatas: (widgetDatas: WebWidgetData[]) => void
    addOrReplaceWidgetData: (widgetData: WebWidgetData) => void
}

export const useWidgetDataStore = create<WebWidgetDataState>((set) => ({
    widgetDatas: [],
    setWidgetDatas: (widgetDatas: WebWidgetData[]) =>
        set(() => ({
            widgetDatas: widgetDatas
        })),
    addOrReplaceWidgetData: (widgetData: WebWidgetData) =>
        set((state) => {
            const existingIndex = state.widgetDatas.findIndex(
                data => data.ReportID === widgetData.ReportID
            );

            if (existingIndex !== -1) {
                const updatedWidgetDatas = [...state.widgetDatas];
                updatedWidgetDatas[existingIndex] = widgetData;
                return { widgetDatas: updatedWidgetDatas };
            } else {
                return { widgetDatas: [...state.widgetDatas, widgetData] };
            }
        }),
}))