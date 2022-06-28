import create from 'zustand'
import { devtools } from 'zustand/middleware'
import { Auth } from 'aws-amplify'

interface TSchool {
    name: string,
    email: string
}


export interface Thread {
    tid: string,
    name: string,
    messages: Message[],
    from: string,
    fromtype: string,
    to: string,
    allocated: string,
    allocated_type: string,
    terminated: boolean,
}
export interface Message {
    timestamp: string,
    message: string,
    owner: string,
    tid: string,
    from: string,
    to: string,
    allocated: string
}
interface TStore {
    school: TSchool,
    workers: string[],
    schools: TSchool[],
    sendJsonMessage?: Function,
    threads: Thread[],
    fetchedThreads: boolean,
    fetchedSchools: boolean,
    setSendJsonMessageFunction(cb: Function): void,
    getWorkers(): Promise<void>,
    getSchools(again: boolean): Promise<void>,
    setSchoolInfo(): Promise<void>,
    addWorker(email: string): Promise<void>,
    getThreads(again: boolean): Promise<void>,
    addThread(thread: Thread): void,
    addMessage(message: Message): void
    terminateThread(threadId: string): void,
    deleteThread(threadId: string): void
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
    threads: [],
    fetchedThreads: false,
    fetchedSchools: false,
    setSendJsonMessageFunction(cb) {
        set((state) => {
            return {
                ...state,
                sendJsonMessage: cb
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
    getSchools: async (again: boolean) => {
        try {
            if (!get().fetchedSchools || again) {
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
                        fetchedSchools: true,
                        schools: res.items
                    }
                })
            }
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
    async getThreads(again: boolean) {
        try {
            if (again || !get().fetchedThreads) {
                const session = await Auth.currentSession()
                const token = session.getAccessToken().getJwtToken()
                const threads = await (await fetch(`${import.meta.env.VITE_API_END_POINT}/getthreads`, {
                    method: 'POST',
                    headers: {
                        'authorization': token,
                    }
                })).json()

                set((state) => {
                    return {
                        ...state,
                        fetchedThreads: true,
                        threads: threads.threads
                    }
                })
            }

        } catch (err) {
            throw err;
        }
    },
    addThread(thread: Thread) {

        console.log(thread)
        try {
            set((state) => {
                let current: Thread[] = []
                if (state.threads) {
                    current = state.threads.slice()
                }

                current.push(thread)
                return {
                    ...state,
                    threads: current
                }
            })
        } catch (error) {
            throw error
        }
    },
    addMessage(message: Message) {
        let clone = get().threads.slice()
        clone.forEach((th: Thread) => {
            if (th.tid === message.tid) {
                if (!th.messages) {
                    th.messages = []
                }
                th.messages.push(message)
            }
        })
        set((state) => {
            return {
                ...state,
                threads: clone
            }
        })
    },
    terminateThread(threadId) {
        let clone = get().threads.slice()
        clone.forEach((th: Thread) => {
            if (th.tid === threadId) {
                th.terminated = true
            }
        })
        set((state) => {
            return {
                ...state,
                threads: clone
            }
        })
    },
    deleteThread(threadId: string){
        let clone = get().threads.slice()
        clone.forEach((th: Thread) => {
            if (th.tid === threadId) {
                th.terminated = true
            }
        })
    }
})))
