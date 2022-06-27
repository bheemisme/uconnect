import { Auth } from "aws-amplify"
import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useStore } from "../store"
import shallow from 'zustand/shallow'

export default function Dashboard(){
    const navigate = useNavigate()
    const [worker,setWorkerInfo] = useStore((state) => [state.worker,state.setWorkerInfo],shallow)
    
    useEffect(() => {
        setWorkerInfo().catch(err => {
            if(err === 'No current user' || err === 'The user is not authenticated'){
                navigate('/signin',{replace: true})
            }
        })
        console.log(worker)
    },[])
    return (
        <div>
            <h1>Dashboard</h1>
            <h2>{worker.email}</h2>
            <h2>{worker.semail}</h2>
        </div>
    )
}