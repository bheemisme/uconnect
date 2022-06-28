import { Auth } from "aws-amplify"
import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useStore } from "../store"
import shallow from 'zustand/shallow'

export default function Dashboard() {

    const navigate = useNavigate()
    const [school, setSchoolInfo, workers, getWorkers, addWorker,threads] = useStore((state) => [state.school, state.setSchoolInfo, state.workers, state.getWorkers, state.addWorker,state.threads,state.getThreads], shallow)

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
            <h1>Dashboard</h1>
            <h2>{school.email}</h2>
            <h2>{school.name}</h2>
            <form onSubmit={(e) => {
                e.preventDefault()
                addWorker(inputs.email)
                setInputs({ email: '' })
            }}>
                <h2>Add Worker</h2>
                <div>
                    <label htmlFor="email"></label>
                    <input type="email" name="email" value={inputs?.email} placeholder="enter worker email" onChange={(e) => {
                        setInputs({ ...inputs, [e.target.name]: e.target.value })
                    }} />
                </div>
                <button className="block" type="submit">Submit</button>
            </form>
            <button className="block" onClick={(e) => {
                e.preventDefault()
                getWorkers().catch(err => {
                    if (err === 'No current user' || err === 'The user is not authenticated') {
                        navigate('/signin', { replace: true })
                    }
                })
            }}>Refresh</button>
            <ul>
                {
                    workers ? workers.map((wrk, index) => {
                        return (<li key={index}>{wrk}</li>)
                    }) : []
                }
            </ul>
            <ul>
                {
                    threads ? threads.filter((th) => th.terminated && th.from == school.email).map((th,index) => {
                        return (<li key={index}>
                            <span>{th.name}</span>
                            <button className="mx-4 border-2 rounded-2xl bg-blue-400 text-white" onClick={(e) => {
                                e.preventDefault()
                                Auth.currentSession().then(session => session.getAccessToken().getJwtToken()).then(token => {
                                    fetch(`${import.meta.env.VITE_API_END_POINT}/deletethread`,{
                                        'method': 'POST',
                                        'headers': {
                                            'content-type': 'application/json',
                                            'authorization': token
                                        },
                                        'body':JSON.stringify({
                                            'threadId': th.tid
                                        })
                                    })
                                }).catch(err => {
                                    navigate('/signin',{replace: true})
                                })
                            }}>
                                delete
                            </button>
                        </li>)
                    }): []

                }
            </ul>
        </div>
    )
}