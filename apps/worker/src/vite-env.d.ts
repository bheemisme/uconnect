/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_REGION: string
    readonly VITE_POOL_ID: string
    readonly VITE_CLIENT_ID: string
    readonly VITE_AUTH_FLOW_TYPE: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
