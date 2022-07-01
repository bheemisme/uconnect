import { useParams } from "react-router-dom"
import shallow from "zustand/shallow"
import { useStore } from "../store"
import { Message } from "../types"


export function Display() {

    const params = useParams()
    const [threads,user] = useStore((state) => [state.threads,state.user],shallow)
    let messages: Message[] = []
    
    let thread = threads.get(`${params.tid}`)
    
    if(thread){
        messages = Array.from(thread.messages.values())
    }
    
    messages.sort((a: Message,b: Message) => {
        return (a.timestamp < b.timestamp) ? -1 : ((a.timestamp > b.timestamp) ? 1 : 0);
    })

    let messageitems = messages.map((message: Message, index: number) => {
        if (user.email === message.owner) {
            return (
                <div key={index} className='text-right mt-6'>
                    <div className='inline bg-sky-400 text-white p-2 rounded-2xl'>{message.message}</div>
                </div>
            )
        }
        return (
            <div key={index} className='text-left mt-6'>
                <div className='inline bg-slate-500 text-white p-2 rounded-2xl'>{message.message}</div>
            </div>
        )

    })
    return (
        <div className='p-4 overflow-y-auto'>
            {messageitems}
        </div>
    )
}
