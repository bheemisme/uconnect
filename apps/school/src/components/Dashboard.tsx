import { Auth } from "aws-amplify"
import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useStore } from "../store"
import shallow from 'zustand/shallow'

export default function Dashboard() {

    const navigate = useNavigate()
    const [school, setSchoolInfo, workers, getWorkers, addWorker, threads, deleteThread] = useStore((state) =>
        [state.school, state.setSchoolInfo, state.workers, state.getWorkers, state.addWorker, state.threads, state.deleteThread], shallow)

    useEffect(() => {
        setSchoolInfo()
        getWorkers().catch(err => {
            if (err === 'No current user' || err === 'The user is not authenticated') {
                navigate('/signin', { replace: true })
            }
        })

    }, [])


    const [inputs, setInputs] = useState<{ email: string }>({ email: "" })
    return (
        <div>
            <h1 className="text-2xl">Dashboard</h1>
            <div className="my-4 ">
                <div>
                    <span className="font-bold">Email: </span>
                    <span>{school.email}</span>
                </div>
                <div>
                    <span className="font-bold">Name: </span>
                    <span>{school.name}</span>
                </div>
            </div>
            <form onSubmit={(e: FormEvent<HTMLFormElement>) => {
                e.preventDefault()
                addWorker(inputs.email)
                setInputs({ email: '' })
            }}>
                <h2 className="text-2xl">Add Worker</h2>
                <div className="my-4">
                    <label className="font-bold" htmlFor="email">Email: </label>
                    <input className="border-2 rounded-xl focus:outline-none p-2 w-[20%]" type="email" name="email" value={inputs?.email} placeholder="enter worker email" onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setInputs({ ...inputs, [e.target.name]: e.target.value })
                    }} />
                </div>
                <button className="block border-2 rounded-xl text-white bg-blue-400 p-2" type="submit">Submit</button>
            </form>

            <ul className="my-4">
                {
                    workers ? workers.map((wrk, index) => {
                        return (<li className="" key={index}>
                            <span>{wrk}</span>
                            <button className="mx-4 border-2 bg-blue-400 rounded-xl p-2 text-white">resend</button>
                            <button className="border-2 bg-blue-400 rounded-xl p-2 text-white" onClick={(e) => {
                                Auth.currentSession().then(session => session.getAccessToken().getJwtToken()).then(jwt => {

                                    fetch(`${import.meta.env.VITE_API_END_POINT}/deleteworker`, {
                                        'method': 'POST',
                                        'body': JSON.stringify({
                                            'email': wrk,
                                            'semail': school.email
                                        }),
                                        'headers': {
                                            'content-type': 'application/json',
                                            'authorization': jwt
                                        }
                                    }).then(res => res.json()).then(output => {
                                        console.log(output)
                                    }).catch(err => {
                                        console.log(err)
                                    })
                                }).catch(err => {
                                    navigate('/signin', { replace: true })
                                })

                            }}>delete</button>
                        </li>)
                    }) : []
                }
            </ul>
            <button className="block border-2 rounded-xl text-black p-2 my-4" onClick={(e) => {
                e.preventDefault()
                getWorkers().catch(err => {
                    if (err === 'No current user' || err === 'The user is not authenticated') {
                        navigate('/signin', { replace: true })
                    }
                })
            }}>Refresh Workers</button>
            <ul className="my-4">
                {

                    threads ? Array.from(threads.values()).filter((th) => th.terminated && th.from == school.email).map((th, index) => {
                        return (<li key={index}>
                            <span>{th.name}</span>
                            <button className="mx-4 border-2 rounded-2xl bg-blue-400 text-white p-2" onClick={(e) => {
                                e.preventDefault()
                                Auth.currentSession().then(session => session.getAccessToken().getJwtToken()).then(token => {
                                    fetch(`${import.meta.env.VITE_API_END_POINT}/deletethread`, {
                                        'method': 'POST',
                                        'headers': {
                                            'content-type': 'application/json',
                                            'authorization': token
                                        },
                                        'body': JSON.stringify({
                                            'threadId': th.tid
                                        })
                                    }).then(res => {
                                        deleteThread(th.tid)
                                    }).catch(err => {
                                        console.error(err)
                                    })
                                }).catch(err => {
                                    navigate('/signin', { replace: true })
                                })
                            }}>
                                delete
                            </button>
                        </li>)
                    }) : []

                }
            </ul>
        </div>
    )
}