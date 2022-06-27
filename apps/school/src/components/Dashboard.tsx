import { Auth } from "aws-amplify"
import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useStore } from "../store"
import shallow from 'zustand/shallow'

export default function Dashboard() {

    const navigate = useNavigate()
    const [school, setSchoolInfo,workers,getWorkers,addWorker] = useStore((state) => [state.school, state.setSchoolInfo,state.workers,state.getWorkers,state.addWorker], shallow)
    
    useEffect(() => {
        setSchoolInfo()
        getWorkers().catch(err => {
            if(err === 'No current user' || err === 'The user is not authenticated'){
                navigate('/signin',{replace: true})
            }
        })
    
    },[])
    const worker_items = workers.map((wrk,index) => {
        return (<li key={index}>{wrk}</li>)
    })
    
    const [inputs,setInputs] = useState<{email: string}>({email: ""})
    return (
        <div>
            <h1>Dashboard</h1>
            <h2>{school.email}</h2>
            <h2>{school.name}</h2>
            <form onSubmit={(e) => {
                e.preventDefault()
                addWorker(inputs.email)
                setInputs({email: ''})
            }}>
                <h2>Add Worker</h2>
                <div>
                    <label htmlFor="email"></label>
                    <input type="email" name="email" value={inputs?.email} placeholder="enter worker email" onChange={(e) => {
                        setInputs({...inputs,[e.target.name]: e.target.value})
                    }}/>
                </div>
                <button className="block" type="submit">Submit</button>
            </form>
            <button className="block" onClick={(e) => {
                e.preventDefault()
                getWorkers().catch(err => {
                    if(err === 'No current user' || err === 'The user is not authenticated'){
                        navigate('/signin',{replace: true})
                    }
                })
            }}>Refresh</button>
            <ul>
                {
                    worker_items
                }
            </ul>
        </div>
    )
}