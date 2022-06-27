import create from 'zustand'
import { devtools } from 'zustand/middleware'
import { Auth } from 'aws-amplify'

interface TUser {
    name: string,
    email: string
}

interface TSchool {
    name: string,
    email: string
}
interface TStore {
    user: TUser,
    schools: TSchool[],
    getSchools(): Promise<void>,
    setUserInfo(): Promise<void>,
};

export const useStore = create<TStore>()(devtools((set, get) => ({
    user: { name: '', email: '' },
    schools: [],
    getSchools: async () => {
        try {
            const session = await Auth.currentSession()
            const res = await (await fetch(`${import.meta.env.VITE_API_END_POINT}/getschools`, {
                method: 'POST',
                headers: {
                    'authorization': session.getAccessToken().getJwtToken()
                }
            })).json()
            set((state) => {
                return {
                    ...state,
                    schools: res.items
                }
            })
        } catch (error) {
            throw error;
        }
    },
    setUserInfo: async () => {
        try {
            const user = await Auth.currentAuthenticatedUser()
            set(state => ({
                ...state,
                user: { ...state.user, name: user.attributes.name, email: user.attributes.email }
            }))
        } catch (error) {
            throw error
        }
    },
})))

