import { useEffect } from "react"
import { IconContext } from "react-icons"
import { ImCross } from "react-icons/im"
import { NavLink, useNavigate } from "react-router-dom"
import shallow from "zustand/shallow"
import { useStore } from "../store"
import { Thread } from "../types"


export function ThreadList() {
    const navigate = useNavigate()
    const [threads, getThreads, sendJsonMessage] = useStore((state) => [state.threads, state.getThreads, state.sendJsonMessage], shallow)
    
    useEffect(() => {
        getThreads(false).catch(err => {
            if (err === 'No current user' || err === 'The user is not authenticated') {
                navigate('/signin', { replace: true })
            }
        })

    }, [])
    const ActiveStyle = 'border-2 rounded-2xl p-2 hover:cursor-pointer text-white bg-sky-400 mb-4 flex flex-row justify-between items-center'
    const InactiveStyle = 'border-2 rounded-2xl p-2 hover:cursor-pointer hover:text-white hover:bg-sky-400 mb-4 flex flex-row justify-between items-center'
    let threadItems: any[] = []
    if (threads) {
        threadItems = Array.from(threads.values()).filter((th: Thread) => {
            return !th.terminated
        }).map((th: Thread, index: number) => {
            return <NavLink className={({ isActive }) => {
                return isActive ? ActiveStyle : InactiveStyle
            }} key={index} to={`${th.tid}`} replace={false}>
                <span>{th.name}</span>
            </NavLink>
        })
    }

    return (
        <div className="border-2 p-2  w-[20%] rounded-2xl mr-4 overflow-y-auto h-full flex flex-col">
            <button className='rounded-xl bg-blue-400 text-white mb-4' onClick={(e) => {
                getThreads(true)
            }}>Refresh</button>
            {threadItems}
        </div>
    )
}
