import create from 'zustand'
import { devtools } from 'zustand/middleware'
import { Auth } from 'aws-amplify'

interface TSchool {
    name: string,
    email: string
}
interface TStore {
    school: TSchool,
    workers: string[],
    schools: TSchool[],
    sclmsg?: string,
    socket?: Function,
    setSocketFunction(cb: Function): void,
    getWorkers(): Promise<void>,
    getSchools(): Promise<void>,
    setSchoolInfo(): Promise<void>,
    addWorker(email: string): Promise<void>,
    sendSclMsg(msg: string): void
};

export async function getToken() {
    const session = await Auth.currentSession()
    const user = await Auth.currentAuthenticatedUser()
    const res = await fetch(`${import.meta.env.VITE_API_END_POINT}/gettoken`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            Authorization: `${session.getAccessToken().getJwtToken()}`
        },
        body: JSON.stringify({
            'email': user.attributes.email
        })
    })
    const token = await res.json()
    return token
}

export const useStore = create<TStore>()(devtools((set, get) => ({
    school: { name: '', email: '' },
    workers: [],
    schools: [],
    sclmsg: "school message",
    setSocketFunction(cb) {
        set((state) => {
            return {
                ...state,
                socket: cb
            }
        })
    },
    getWorkers: async () => {
        try {
            const session = await Auth.currentSession()
            const res = await (await fetch(`${import.meta.env.VITE_API_END_POINT}/getworkers`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'Authorization': session.getAccessToken().getJwtToken()
                },
                body: JSON.stringify({
                    'email': get().school.email
                })
            })).json()
            set((state) => {
                return {
                    ...state,
                    workers: res.emails
                }
            })
        } catch (error) {
            throw error
            // console.log(error)
        }
    },
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
            console.log(error)
        }
    },
    setSchoolInfo: async () => {
        try {
            const scl = await Auth.currentAuthenticatedUser()
            set(state => ({
                ...state,
                school: { ...state.school, name: scl.attributes.name, email: scl.attributes.email }
            }))
        } catch (error) {
            console.log(error)
        }
    },
    addWorker: async (email: string) => {
        try {
            const session = await Auth.currentSession()
            console.log(get().school.email)
            await (await fetch(`${import.meta.env.VITE_API_END_POINT}/addworker`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'Authorization': session.getAccessToken().getJwtToken()
                },
                body: JSON.stringify({
                    'email': email,
                    'semail': get().school.email
                })
            })).json()
        } catch (error) {
            console.error(error)
        }
    },
    sendSclMsg(msg) {
        set((state) => {
            return {
                ...state,
                sclmsg: msg
            }
        })
    },
})))
