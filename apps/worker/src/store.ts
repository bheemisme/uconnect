import create from 'zustand'
import { devtools } from 'zustand/middleware'
import { Auth } from 'aws-amplify'

interface TWorker {
    email: string,
    semail: string
}


interface TStore {
    worker: TWorker,
    setWorkerInfo(): Promise<void>,
};

export const useStore = create<TStore>()(devtools((set,get) => ({
    worker: {email: '',semail: ''},
    setWorkerInfo: async() => {
        try {
            const user = await Auth.currentAuthenticatedUser()
            console.log(user)
            set(state => ({
                ...state,
                worker: { ...state.worker, email: user.attributes.email, semail: user.attributes['custom:semail'] }
            }))
        } catch (error) {
            throw error
        }

    }
})))