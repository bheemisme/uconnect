import { useState,useEffect } from "react"
import { IconContext } from "react-icons"
import { BsArrowRightCircleFill } from "react-icons/bs"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import shallow from "zustand/shallow"
import { useStore } from "../store"

export function Input() {
    const params = useParams()
    const [threads,sendJsonMessage,user] = useStore((state) => [state.threads,state.sendJsonMessage,state.user],shallow)
    const [input, setInput] = useState("")
    const navigate = useNavigate()
    useEffect(() => {
        setInput('')
    }, [params])

    if(!params.tid){
        navigate('/threads',{replace: true})
    }
    
    return (
        <form onSubmit={(e) => {
            e.preventDefault()
            
            // timestamp: string,
            // tid: string,
            // message: string,
            // owner: boolean
            
            if(sendJsonMessage){
                
                let mid = crypto.randomUUID()
                let thread = threads.get(`${params.tid}`)
                if(!thread){
                    throw new Error("no thread available");
                }

                while(thread.messages.has(mid)){
                    mid = crypto.randomUUID()
                }
                
                sendJsonMessage({'action':'sendmessage','message': {
                    'timestamp': new Date().toISOString(),
                    'tid': thread.tid,
                    'message': input,
                    "owner": user.email,
                    "mid": mid
                }})
                setInput('')
            }
            
        }} className="w-full border-2 border-sky-300 rounded-3xl p-2 flex flex-row justify-between">
            <input type="text" value={input} className="focus:outline-none px-4 w-full" placeholder="enter message" onChange={(e) => {
                e.preventDefault()
                setInput(e.target.value)
            }} />
            <IconContext.Provider value={{ className: "scale-x-10" }}>
                <button type='submit'>
                    <BsArrowRightCircleFill />
                </button> 
            </IconContext.Provider>
        </form>
    )
}
