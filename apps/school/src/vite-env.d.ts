/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_REGION: string
    readonly VITE_POOLID: string
    readonly VITE_CLIENTID: string
    readonly VITE_AUTH_FLOW_TYPE: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
