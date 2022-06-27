import { Auth } from "aws-amplify"
import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useStore } from "../store"
import shallow from 'zustand/shallow'

export default function Dashboard(){
    const navigate = useNavigate()
    const [user,setUserInfo] = useStore((state) => [state.user,state.setUserInfo],shallow)
    useEffect(() => {
        setUserInfo().catch(err => {
            if(err === 'No current user' || err === 'The user is not authenticated'){
                navigate('/signin',{replace: true})
            }
        })
    },[])
    return (
        <div>
            <h1>Dashboard</h1>
            <h2>{user.email}</h2>
            <h2>{user.name}</h2>
        </div>
    )
}