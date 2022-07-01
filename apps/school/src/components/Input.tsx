import { useState,useEffect } from "react"
import { IconContext } from "react-icons"
import { BsArrowRightCircleFill } from "react-icons/bs"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import shallow from "zustand/shallow"
import { useStore } from "../store"

export function Input() {
    const params = useParams()
    const [threads,sendJsonMessage,scl] = useStore((state) => [state.threads,state.sendJsonMessage,state.school],shallow)
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
                
                sendJsonMessage({'action':'sendmessage','message': {
                    'timestamp': new Date().toISOString(),
                    'tid': threads.get(`${params.tid}`)?.tid,
                    'message': input,
                    "owner": scl.email,
                    "mid": crypto.randomUUID()
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
