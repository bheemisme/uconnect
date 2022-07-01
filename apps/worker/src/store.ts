import create from 'zustand'
import { devtools } from 'zustand/middleware'
import { Auth } from 'aws-amplify'
import {Message, Store, Thread} from './types'
import produce,{enableMapSet} from 'immer'

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



export const useStore = create<Store>()(devtools((set,get) => ({
    
    fetchedThreads: false,
    threads: new Map<string,Thread>(),
    setSendJsonMessageFunction(cb: Function) {
        set(produce((draft: Store) => {
            draft.sendJsonMessage = cb
        }))
    },
    setWorkerInfo: async() => {
        try {
            const user = await Auth.currentAuthenticatedUser()
            console.log(user)
            set(produce((draft: Store) => {
                draft.worker = {
                    'email': user.attributes.email,
                    'semail': user.attributes['custom:semail']
                }
            }))
            
        } catch (error) {
            throw error
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
                    for(let th of threads.threads){
                        let msgs = new Map<string,Message>()

                        for(let msg of th.messages){
                            msgs.set(msg.mid,msg)
                        }
                        console.log(msgs)
                        th.messages = msgs
                        console.log(th.messages)
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
                thread.messages = new Map<string,Message>()
                draft.threads.set(thread.tid,thread)
            })
        )
    },
    addMessage(message: Message) {
        set(produce((draft: Store) => {
            draft.threads.get(message.tid)?.messages.set(message.mid,message)
        }))
    },
    terminateThread(threadId) {
        set(produce((draft: Store) => {
            let thread = draft.threads.get(threadId)
            if(thread){
                draft.threads.delete(threadId)
            }
        }))
    },
    deleteStore() {
        set(produce((draft: Store) => {
            draft.threads.clear()
            draft.worker = undefined
            draft.sendJsonMessage = undefined
            draft.fetchedThreads = false
        }))
    },

})))