import { BsArrowRightCircleFill } from 'react-icons/bs'
import { IconContext } from 'react-icons'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useParams, useNavigate, Navigate } from 'react-router-dom'
import { ImCross } from 'react-icons/im'
import { useStore, Thread, Message } from '../store'
import shallow from 'zustand/shallow'
import { Auth } from 'aws-amplify'


function ThreadList() {
    const navigate = useNavigate()
    const [threads, getThreads,sendJsonMessage] = useStore((state) => [state.threads, state.getThreads,state.sendJsonMessage], shallow)
    useEffect(() => {
        getThreads(false).catch(err => {
            if (err === 'No current user' || err === 'The user is not authenticated') {
                navigate('/signin', { replace: true })
            }
        })

    },[])
    const ActiveStyle = 'border-2 rounded-2xl p-2 hover:cursor-pointer text-white bg-sky-400 mb-4 flex flex-row justify-between items-center'
    const InactiveStyle = 'border-2 rounded-2xl p-2 hover:cursor-pointer hover:text-white hover:bg-sky-400 mb-4 flex flex-row justify-between items-center'
   let threadItems: any[] = []
    if(threads){
        threadItems = threads.filter((th: Thread) => !th.terminated).map((th: Thread, index: number) => {
            return <NavLink className={({ isActive }) => {
                return isActive ? ActiveStyle : InactiveStyle
            }} key={index} to={`${index}`} replace={false}>
                <span>{th.name}</span>
                <IconContext.Provider value={{ className: "inline" }} >
                    <ImCross onClick={(e) => {
                        e.preventDefault()
                        if(sendJsonMessage){
                            sendJsonMessage({'action': 'terminatethread','threadId': th.tid})
                        }
                    }} />
                </IconContext.Provider>
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

function Display() {

    const params = useParams()
    const [threads,scl] = useStore((state) => [state.threads,state.school],shallow)
    let messages: Message[] = []
    if(params.tid && threads[Number(params.tid)] && threads[Number(params.tid)].messages){
        messages = threads[Number(params.tid)].messages
    }
    let messageitems = messages.map((message: Message, index: number) => {
        if (scl.email === message.owner) {
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

function Input() {
    const params = useParams()
    const [threads,sendJsonMessage,scl] = useStore((state) => [state.threads,state.sendJsonMessage,state.school],shallow)
    const [input, setInput] = useState("")
    useEffect(() => {
        setInput('')
    }, [params])

    return (
        <form onSubmit={(e) => {
            e.preventDefault()
            
            // timestamp: string,
            // tid: string,
            // message: string,
            // owner: boolean
            if(sendJsonMessage){
                sendJsonMessage({'action':'sendmessage','message': {
                    timestamp: new Date().toISOString(),
                    tid: threads[Number(params.tid)].tid,
                    message: input,
                    owner: scl.email
                }})
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

export function Chat() {
    
    return (
        <div className="border-2 p-2 w-[80%] flex flex-col-reverse rounded-2xl">
            <Input  />
            <Display />
        </div>
    )
}
export function Threads() {

    return (
        <div className="h-full rounded-2xl flex flex-row">
            <ThreadList />
            <Outlet />
        </div>
    )
}

// one way  is directly clicking threads button
// through redirects, when creating a thread

// when we click the threads button, it should not select any thread by default
// when we click any of thread, then 