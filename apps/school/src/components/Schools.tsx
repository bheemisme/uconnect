import { useLocation, useNavigate } from "react-router-dom"
import { useStore } from "../store"
import shallow from 'zustand/shallow'
import { useEffect } from "react"
import useWebSocket,{ReadyState} from 'react-use-websocket'
export default function Schools() {

    const navigate = useNavigate()
    const location = useLocation()
    
    const [schools, getSchools] = useStore((state) => [state.schools, state.getSchools],shallow)

    
    useEffect(() => {
        getSchools()
    }, [])

    return (
        <div className="flex flex-row flex-wrap">
            <button className="block" onClick={(e) => {
                e.preventDefault()
                getSchools().catch(err => {
                    if(err === 'No current user' || err === 'The user is not authenticated'){
                        navigate('/signin',{replace: true})
                    }
                })
            }}>Refresh</button>
            
            {
                schools.map((scl, index) => {
                    return (
                        <button key={index} onClick={(e) => {
                            e.preventDefault()
                            // console.log(wsurl)
                            // socket.sendJsonMessage({'action': 'newthread','payload': {semail: scl.email,tname: 'fee'}})
                        }} className="border-2 rounded-2xl p-2 ml-4 mb-4 w-30 hover:cursor-pointer hover:text-white hover:bg-sky-400">
                            {scl.name}
                        </button>
                    )
                })
            }
        </div>
    )
}