import { BsArrowRightCircleFill } from 'react-icons/bs'
import { IconContext } from 'react-icons'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useParams,useNavigate } from 'react-router-dom'

function ThreadList() {
    // any new threads should be added
    // if any terminated threads should be removed
    // fetch from data
    const navigate = useNavigate()
    const [threads, addThread] = useState(["thread 1","thread 2"] as string[])
    const ActiveStyle = 'border-2 rounded-2xl p-2 hover:cursor-pointer text-white bg-sky-400 mb-4 flex flex-row justify-between items-center'
    const InactiveStyle = 'border-2 rounded-2xl p-2 hover:cursor-pointer hover:text-white hover:bg-sky-400 mb-4 flex flex-row justify-between items-center'
    const threadItems = threads.map((th: string, index: number) => {
        return <NavLink className={({ isActive }) => {
            return isActive ? ActiveStyle : InactiveStyle
        }} key={index} to={`${index}`} replace={false}>
            <span>{th}</span>
        </NavLink>
    })

    return (
        <div className="border-2 p-2  w-[20%] rounded-2xl mr-4 overflow-y-auto h-full flex flex-col">
            {threadItems}
        </div>
    )
}

function Display(props: { messages: { msg: string, from: boolean }[] }) {
    let messageitems = props.messages.map((message: { msg: string, from: boolean }, index: number) => {
        if (message.from) {
            return (
                <div key={index} className='text-right mt-6'>
                    <div className='inline bg-sky-400 text-white p-2 rounded-2xl'>{message.msg}</div>
                </div>
            )
        }
        return (
            <div key={index} className='text-left mt-6'>
                <div className='inline bg-slate-500 text-white p-2 rounded-2xl'>{message.msg}</div>
            </div>
        )

    })
    return (
        <div className='p-4 overflow-y-auto'>
            {messageitems}
        </div>
    )
}

function Input(props: { addMessages: Function }) {
    const params = useParams()

    const [input, setInput] = useState("")
    useEffect(() => {
        setInput('')
    },[params])

    return (
        <form onSubmit={(e) => {
            e.preventDefault()
            props.addMessages(input)
            setInput("")
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
    // make request and get all messages
    //
    const params = useParams()
    
    let arr: { from: boolean, msg: string }[] = []
    const [messages, addMessages] = useState(arr)
    
    useEffect(() => {
        addMessages([])
    },[params])
    return (
        <div className="border-2 p-2 w-[80%] flex flex-col-reverse rounded-2xl">
            <Input addMessages={(msg: string) => {
                messages.push({ from: true, msg: msg })
                addMessages([...messages])
            }} />
            <Display messages={messages} />
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