import create from 'zustand'
import { devtools } from 'zustand/middleware'
import { Auth } from 'aws-amplify'
import produce, { enableMapSet } from 'immer'
import { Message, Thread, Store } from './types'

enableMapSet()
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

export const useStore = create<Store>()(devtools((set, get) => ({
    school: { name: '', email: '' },
    workers: [],
    schools: [],
    threads: new Map<string, Thread>(),
    fetchedThreads: false,
    fetchedSchools: false,
    setSendJsonMessageFunction(cb: Function) {
        set(produce((draft: Store) => {
            draft.sendJsonMessage = cb
        }))
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

            set(produce((draft: Store) => {
                draft.workers = res.emails
            }))
        } catch (error) {
            throw error
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
                set(produce((draft: Store) => {
                    draft.fetchedSchools = true
                    draft.schools = res.schools
                }))
            }
        } catch (error) {
            console.log(error)
        }
    },
    setSchoolInfo: async () => {
        try {
            const scl = await Auth.currentAuthenticatedUser()
            set(produce((draft: Store) => {
                draft.school.name = scl.attributes.name
                draft.school.email = scl.attributes.email
            }))
        } catch (error) {
            console.log(error)
        }
    },
    addWorker: async (email: string) => {
        try {
            const session = await Auth.currentSession()
            console.log(get().school.email)
            const res = await (await fetch(`${import.meta.env.VITE_API_END_POINT}/addworker`, {
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
                set(produce((draft: Store) => {
                    draft.fetchedThreads = true
                    draft.fetchedThreads = true
                    for(let th of threads.threads){
                        let msgs = new Map<string,Message>()
                        for(let msg of th.messages){
                            msgs.set(msg.mid,msg)
                        }
                        th.messages = msgs
                        draft.threads.set(th.tid,th)
                    }
                }))
            }
        } catch (err) {
            throw err;
        }
    },
    addThread(thread: Thread) {
        set(
            produce((draft: Store) => {

                thread.messages = new Map<string, Message>()
                // draft.threads[thread.tid] = thread?
                draft.threads.set(thread.tid, thread)
            })
        )
    },
    addMessage(message: Message) {
        set(produce((draft: Store) => {
            draft.threads.get(message.tid)?.messages.set(message.mid, message)
        }))
    },
    terminateThread(threadId) {
        set(produce((draft: Store) => {
            let thread = draft.threads.get(threadId)
            if (thread) {
                thread.terminated = true
                if (thread.from !== draft.school.email) {
                    draft.threads.delete(threadId)
                }
            }
        }))
    },

    deleteThread(threadId: string) {
        set(produce((draft: Store) => {
            draft.threads.delete(threadId)
        }))
    },
    deleteStore(){
        set(produce((draft: Store) => {
            draft.threads.clear()
            draft.schools = []
            draft.school = {'email': '','name': ''}
            draft.fetchedSchools = false
            draft.fetchedThreads = false
            draft.sendJsonMessage = undefined
            draft.workers = []
        }))
    }
})))
