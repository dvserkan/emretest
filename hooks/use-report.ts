
import { useFilterStore } from '@/stores/filters-store';
import { useWidgetDataStore } from '@/stores/widget-data-store';
import axios from 'axios';
/*
interface UseQueryResult<T> {
    execute: (reportId: number) => Promise<void>;
}

export function useReport<T = any>(): UseQueryResult<T> {

	const {
		selectedFilter,
	} = useFilterStore();
    
    const {
		widgetDatas,
        addWidgetData
	} = useWidgetDataStore();


    const execute = async (reportId: number) => {
        try {

            if (response.status != 200) {
                throw new Error(result.message || 'Query execution failed');
            }
            addWidgetData(result)
        } catch (err) {

        } finally {
        }
    };



    return { execute };
}*/