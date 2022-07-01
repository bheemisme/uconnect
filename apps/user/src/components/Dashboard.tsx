import { Auth } from "aws-amplify"
import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useStore } from "../store"
import shallow from 'zustand/shallow'


export default function Dashboard() {
    const navigate = useNavigate()
    const [user, setUserInfo,threads,deleteThread] = useStore((state) => [state.user, state.setUserInfo,state.threads,state.deleteThread], shallow)
    useEffect(() => {
        setUserInfo().catch(err => {
            if (err === 'No current user' || err === 'The user is not authenticated') {
                navigate('/signin', { replace: true })
            }
        })
    }, [])
    return (
        <div>
            <h1 className="text-2xl">Dashboard</h1>
            <div className="my-4 ">
                <div>
                    <span className="font-bold">Email: </span>
                    <span>{user.email}</span>
                </div>
                <div>
                    <span className="font-bold">Name: </span>
                    <span>{user.name}</span>
                </div>
            </div>

            <div>
                <ul>
                    {

                        threads ? Array.from(threads.values()).filter((th) => th.terminated && th.from == user.email).map((th, index) => {
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
        </div>
    )
}