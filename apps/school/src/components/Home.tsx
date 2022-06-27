import { useCallback, useEffect, useRef, useState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { Auth } from "aws-amplify"
import ulogo from '/ulogo.jpg'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { useStore } from "../store"
import shallow from 'zustand/shallow'


export default function Home() {
    const navigate = useNavigate()

    useEffect(() => {
        Auth.currentSession().catch(() => {
            navigate('/signin', { replace: true })
        })
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
                        socket.sendJsonMessage({'action': 'newthread','message': 'requesting a new thread'})
                    }}>Send Message
                </button> */}
                    <Outlet />
                </div>
            </div>
        </div>
    )
}