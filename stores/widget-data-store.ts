import { BranchModel, WebWidgetData } from '@/types/tables'
import { create } from 'zustand'

interface WebWidgetDataState {
    widgetDatas: WebWidgetData[],
    branchDatas: BranchModel[],
    setWidgetDatas: (widgetDatas: WebWidgetData[]) => void,
    setBranchDatas: (branchDatas: BranchModel[]) => void,
    addOrReplaceWidgetData: (widgetData: WebWidgetData) => void,
    addOrReplaceBranchData: (branchData: BranchModel) => void
}

export const useWidgetDataStore = create<WebWidgetDataState>((set) => ({
    widgetDatas: [],
    branchDatas: [],
    setWidgetDatas: (widgetDatas: WebWidgetData[]) => {
        console.log('Setting widget data:', widgetDatas);
        set(() => ({
            widgetDatas: widgetDatas
        }));
    },
    setBranchDatas: (branchDatas: BranchModel[]) => {
        console.log('Setting branch data:', branchDatas);
        set(() => ({
            branchDatas: branchDatas
        }));
    },
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
    addOrReplaceBranchData: (branchData: BranchModel) =>
        set((state) => {
            const existingIndex = state.branchDatas.findIndex(
                data => data.BranchID === branchData.BranchID
            );

            if (existingIndex !== -1) {
                const updatedBranchDatas = [...state.branchDatas];
                updatedBranchDatas[existingIndex] = branchData;
                return { branchDatas: updatedBranchDatas };
            } else {
                return { branchDatas: [...state.branchDatas, branchData] };
            }
        }),
}))
