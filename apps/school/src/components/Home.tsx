import { useCallback, useEffect, useRef, useState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { Auth } from "aws-amplify"
import ulogo from '/ulogo.jpg'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { useStore, getToken } from "../store"
import shallow from 'zustand/shallow'
import { WebSocketHook, WebSocketLike } from "react-use-websocket/dist/lib/types"


export default function Home() {
    useEffect(() => {
        Auth.currentSession().catch(() => {
            navigate('/signin', { replace: true })
        })
    },[])

    const navigate = useNavigate()
    const getUrl = useCallback(async () => {
        const token = (await getToken()).token
        return `${import.meta.env.VITE_SOCKET_END_POINT}?token=${token}`
    }, [])

    const [socketFunction,addThread,setSchoolInfo,addMessage,terminateThread] = useStore((state) => [state.setSendJsonMessageFunction,state.addThread,state.setSchoolInfo,state.addMessage,state.terminateThread],shallow)
    const socket =  useWebSocket(getUrl,{
        protocols: ['school'],
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
        onMessage(event){
            const data = JSON.parse(event.data)
            console.log(event)
            if(data.event == 'newthread' && !data.error){
                addThread(data.payload)
            }

            if(data.event == 'sendmessage' && !data.error){
                console.log(data.payload)
                addMessage(data.payload)
            }

            if(data.event == 'terminatethread' && !data.error){
                console.log(data.payload)
                terminateThread(data.payload.threadId)
            }
        }
    })
    
    useEffect(() => {
        socketFunction(socket.sendJsonMessage)
        setSchoolInfo()
    }, [])

    let inactiveClassName = "p-4 hover:text-white hover:bg-sky-300 hover:cursor-pointer"
    let activeClassName = "p-4 text-white bg-sky-300 cursor-pointer"
    return (
        <div className="flex flex-col h-full">
            <div className="font-bold flex flex-row justify-center h-[10%]">
                <img src={ulogo} className="w-14" alt="ulogo" />
            </div>
            <div className={`flex flex-row justify-between h-[90%]`}>
                <div className="flex flex-col w-[15%] border-2 rounded-3xl">
                    <NavLink to="/" className={({ isActive }) => {
                        return isActive ? activeClassName : inactiveClassName
                    }}>Dashboard</NavLink>
                    <NavLink to="schools" className={({ isActive }) => {
                        return isActive ? activeClassName : inactiveClassName
                    }}>Schools</NavLink>
                    <NavLink to="threads" className={({ isActive }) => {
                        return isActive ? activeClassName : inactiveClassName
                    }}>Threads</NavLink>
                    <NavLink to="settings" className={({ isActive }) => {
                        return isActive ? activeClassName : inactiveClassName
                    }}>Settings</NavLink>
                </div>

                <div className="p-4 border-2 w-[85%] rounded-3xl">
                    {/* <button onClick={(e) => {
                        Auth.currentSession().then(session => {
                            fetch(`${import.meta.env.VITE_API_END_POINT}/getthreads`,{
                                method: 'POST',
                                headers: {
                                    'authorization': session.getAccessToken().getJwtToken(),
                                }
                            }).then(res => res.json()).then(threads => {
                                console.info(threads)
                            }).catch(err => {
                                console.error(err)
                            })
                        }).catch(() => {
                            navigate('/signin', { replace: true })
                        })
                    }}>Send Message
                </button> */}
                    <Outlet />
                </div>
            </div>
        </div>
    )
}