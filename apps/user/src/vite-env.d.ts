/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_REGION: string
    readonly VITE_POOLID: string
    readonly VITE_CLIENTID: string
    readonly VITE_AUTH_FLOW_TYPE: string
    readonly VITE_API_END_POINT: string
    readonly VITE_SOCKET_END_POINT: string
    readonly VITE_API_ID: string
    readonly VITE_SOCKET_ID: string
    readonly VITE_SOCKET_STAGE: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
