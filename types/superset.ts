export type SuperSetColumnType = {
    column_name?: string;
    is_dttm?: boolean;
    name?: string;
    type?: string;
    type_generic?: number;
}

export type SuperSetExecuteResponse<T> = {
    columns?: SuperSetColumnType[];
    selected_columns?: SuperSetColumnType[];
    data?: T[];
    query_id: number;
    status: string;
}

export type SuperSetCrsfResponse = {
    result?: string;
}

export type SuperSetLoginResponse = {
    access_token?: string;
    refresh_token?: string;
}

export type SuperSetErrorResponse= {
    error: string;
    message: string;
}

export type SuperSetQueryOptions = {
    database_id?: number;
    runAsync?: boolean;
    templateParams?: string;
    schema?: string;
}

export type SuperSetDatabaseResult = {
    id: number;
    database_name: string;
    uuid: string;
    backend?: string;
    allow_run_async?: boolean;
}

export type SuperSetDatabaseResponse = {
    result: SuperSetDatabaseResult[]
}
