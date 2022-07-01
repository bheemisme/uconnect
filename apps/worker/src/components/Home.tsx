import { useCallback, useEffect } from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { Auth } from "aws-amplify"
import ulogo from '/ulogo.jpg'
import { getToken, useStore } from "../store"
import shallow from "zustand/shallow"
import useWebSocket from "react-use-websocket"
export default function Home() {
    const navigate = useNavigate()
    
    useEffect(() => {
        Auth.currentSession().catch(() => {
            navigate('/signup', { replace: true })
        })
    }, [])

    const getUrl = useCallback(async () => {
        const token = (await getToken()).token
        return `${import.meta.env.VITE_SOCKET_END_POINT}?token=${token}`
    }, [])

    const [socketFunction,setWorkerInfo,addMessage,addThread,terminateThread,getThreads] = useStore((state) => [state.setSendJsonMessageFunction,state.setWorkerInfo,state.addMessage,state.addThread,state.terminateThread,state.getThreads],shallow)

    const socket =  useWebSocket(getUrl,{
        protocols: ['worker'],
        retryOnError: true,
        reconnectAttempts: 5,
        onOpen(e){
            console.log('connected')
        },
        onClose(){
            console.log('closed')
        },
        onError(e){
            console.log(e)
            console.log('error')
        },
        shouldReconnect(event) {
            return true
        },
        onMessage(event: MessageEvent){
            const data = JSON.parse(event.data)
            console.log(event)
            if(data.event == 'newthread' && !data.error){
                console.log(data.payload)
                addThread(data.payload)
            }

            if(data.event == 'sendmessage' && !data.error){
                console.log(data.payload)
                addMessage(data.payload)
            }

            if(data.event == 'terminatethread' && !data.error){
                console.log(data.payload)
                terminateThread(data.payload.threadId)
                navigate('/threads',{replace: true})
            }
        }
    })
    
    useEffect(() => {
        socketFunction(socket.sendJsonMessage)
        setWorkerInfo()
        getThreads(false)
    }, [])

    let inactiveClassName = "p-4 hover:text-white hover:bg-sky-300 hover:cursor-pointer"
    let activeClassName = "p-4 text-white bg-sky-300 cursor-pointer"
    return (
        <div className="h-screen flex flex-col">
            <div className="font-bold  flex flex-row justify-center border-2 h-[10%]">
                <img src={ulogo} className="w-14" alt="ulogo" />
            </div>
            <div className={`flex flex-row h-full`}>
                <div className="flex flex-col w-[15%] border-2">
                    <NavLink to="/" className={({ isActive }) => {
                        return isActive ? activeClassName : inactiveClassName
                    }}>Dashboard</NavLink>
                    <NavLink to="threads" className={({ isActive }) => {
                        return isActive ? activeClassName : inactiveClassName
                    }}>Threads</NavLink>
                    <NavLink to="settings" className={({ isActive }) => {
                        return isActive ? activeClassName : inactiveClassName
                    }}>Settings</NavLink>
                </div>

                <div className="p-10 border-2 w-[85%]">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}