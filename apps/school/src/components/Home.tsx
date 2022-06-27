import { useCallback, useEffect, useRef, useState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { Auth } from "aws-amplify"
import ulogo from '/ulogo.jpg'
import useWebSocket,{ReadyState} from 'react-use-websocket'
async function getToken() {
    const session = await Auth.currentSession()
    const user = await Auth.currentAuthenticatedUser()
    const res = await fetch("https://ec7ovfiy9j.execute-api.ap-south-1.amazonaws.com/gettoken", {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            Authorization: `${session.getAccessToken().getJwtToken()}`
        },
        body: JSON.stringify({
            'email': user.attributes.email
        })
    })
    const token = await res.json()
    return token
}
export default function Home() {
    const navigate = useNavigate()
    
    useEffect(() => {

        Auth.currentSession().then(session => {
            // fetch('	https://ec7ovfiy9j.execute-api.ap-south-1.amazonaws.com/addworker',{
            //     method: 'POST',
            //     headers: {
            //         'content-type': 'application/json',
            //         'Authorization': session.getAccessToken().getJwtToken()
            //     },
            //     body: JSON.stringify({'email': 'esxzxwbjdvjirxipmk@nthrl.com','semail': 'fenoc33383@giftcv.com'})
            // }).then(res => res.json()).then(res => console.log(res)).catch(err => console.error(err))
        }).catch(() => {
            navigate('/signin', { replace: true })
        })

    }, [])

    const getUrl= useCallback(async () => {
        
        const token = (await getToken()).token
        return `wss://wq34pkwd2a.execute-api.ap-south-1.amazonaws.com/uconnect?token=${token}`
    },[])

    // const socket=  useWebSocket(getUrl,{
    //     protocols: ['school'],
    //     retryOnError: true,
    //     reconnectAttempts: 5,
    //     onOpen(){
    //         console.log('connected')
            
    //     },
    //     onClose(){
    //         console.log('closed')
    //     },
    //     onError(){
    //         console.log('error')
    //     },
    //     shouldReconnect(event) {
    //         return false
    //     },
    //     onMessage(event){
    //         console.log('message: ')
    //         console.log(event)
    //     }
    // })
    
    


    let inactiveClassName = "p-4 hover:text-white hover:bg-sky-300 hover:cursor-pointer"
    let activeClassName = "p-4 text-white bg-sky-300 cursor-pointer"
    return (
        <div className="flex flex-col h-full">
            <div className="font-bold flex flex-row justify-center h-[10%]">
                <img src={ulogo} className="w-14" alt="ulogo" />
            </div>
            <div className={`flex flex-row justify-between h-[90%]`}>
                <div className="flex flex-col w-[15%] border-2 rounded-3xl">
                    <NavLink to="/" className={({ isActive }) => {
                        return isActive ? activeClassName : inactiveClassName
                    }}>Dashboard</NavLink>
                    <NavLink to="schools" className={({ isActive }) => {
                        return isActive ? activeClassName : inactiveClassName
                    }}>Schools</NavLink>
                    <NavLink to="threads" className={({ isActive }) => {
                        return isActive ? activeClassName : inactiveClassName
                    }}>Threads</NavLink>
                    <NavLink to="settings" className={({ isActive }) => {
                        return isActive ? activeClassName : inactiveClassName
                    }}>Settings</NavLink>
                </div>
                    
                <div className="p-4 border-2 w-[85%] rounded-3xl">
                {/* <button onClick={(e) => {
                        socket.sendJsonMessage({'action': 'newthread','message': 'requesting a new thread'})
                    }}>Send Message
                </button> */}
                    <Outlet />
                </div>
            </div>
        </div>
    )
}