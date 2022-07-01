import { useLocation, useNavigate } from "react-router-dom"
import { useStore,getToken } from "../store"
import shallow from 'zustand/shallow'
import { useCallback, useEffect, useState } from "react"
import useWebSocket,{ReadyState} from 'react-use-websocket'
import { Dialog } from "@headlessui/react"
export default function Schools() {

    const navigate = useNavigate()
    const location = useLocation()

    // console.log('callback: ',location.state)
    
    const [schools, getSchools,sendJsonMessage] = useStore((state) => [state.schools, state.getSchools,state.sendJsonMessage],shallow)

    
    useEffect(() => {
        getSchools(false)
    }, [])

    

    return (
        <div className="flex flex-row flex-wrap">
            <button className="block" onClick={(e) => {
                e.preventDefault()
                getSchools(true).catch(err => {
                    if(err === 'No current user' || err === 'The user is not authenticated'){
                        navigate('/signin',{replace: true})
                    }
                })
            }}>Refresh</button>
            

            {
                schools ? schools.map((scl, index) => {

                    return (
                        <button key={index} onClick={(e) => {
                            e.preventDefault()
                            const name = prompt('enter thread name')
                            if(sendJsonMessage && name!='' && name != null){
                                sendJsonMessage({'action': 'newthread','payload': {email: scl.email,name: name,tid: crypto.randomUUID()}})
                            }
                        }} className="border-2 rounded-2xl p-2 ml-4 mb-4 w-30 hover:cursor-pointer hover:text-white hover:bg-sky-400">
                            {scl.name}
                        </button>
                    )
                }): []
            }

            
        </div>
    )
}
