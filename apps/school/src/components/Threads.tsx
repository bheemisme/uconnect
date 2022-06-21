import { BsArrowRightCircleFill } from 'react-icons/bs'
import { IconContext } from 'react-icons'
import { useState } from 'react'
function ThreadList() {
    const [threads, addThread] = useState(['thread1', 'thread2', 'thread6', 'thread6', 'thread6', 'thread6', 'thread6', 'thread6', 'thread6', 'thread6', 'thread6', 'thread6'])
    const threadItems = threads.map((th: string, index: number) => {
        return (<div className='border-2 rounded-2xl p-2 hover:cursor-pointer hover:text-white hover:bg-sky-400 mb-4' key={index}>{th}</div>)
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
                <div key={index} className='text-right'>
                    <div className='inline bg-sky-400 text-white p-2 rounded-2xl'>{message.msg}</div>
                </div>
            )
        }
        return (
            <div key={index} className='text-left'>
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

function Input() {
    const [input, setInput] = useState("")
    return (
        <div className="w-full border-2 border-sky-300 rounded-3xl p-2 flex flex-row justify-between">
            <input type="text" value={input} className="focus:outline-none px-4 w-full" placeholder="enter message" onChange={(e) => {
                e.preventDefault()
                setInput(e.target.value)
            }} />
            <IconContext.Provider value={{ className: "scale-x-10" }}>
                <button>
                    <BsArrowRightCircleFill />
                </button>
            </IconContext.Provider>
        </div>
    )
}

function Chat() {
    const [messages, addMessages] = useState([{ msg: 'asdf', from: true }, { msg: 'asasldjfldf', from: false }])
    return (
        <div className="border-2 p-2 w-[80%] flex flex-col-reverse rounded-2xl">
            <Input />
            <Display messages={messages} />
        </div>
    )
}
export default function Threads() {
    return (
        <div className="h-full rounded-2xl flex flex-row">
            <ThreadList />
            <Chat />
        </div>
    )
}