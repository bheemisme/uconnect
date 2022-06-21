import { useEffect } from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { Auth } from "aws-amplify"
import ulogo from '/ulogo.jpg'
export default function Home() {
    const navigate = useNavigate()
    useEffect(() => {
        Auth.currentSession().catch(() => {
            navigate('/signin', { replace: true })
        })

    }, [])
    let inactiveClassName = "p-4 hover:text-white hover:bg-sky-300 hover:cursor-pointer"
    let activeClassName = "p-4 text-white bg-sky-300 cursor-pointer"
    return (
        <div className="h-screen flex flex-col">
            <div className="font-bold  flex flex-row justify-center border-2 h-[10%]">
                <img src={ulogo} className="w-14" alt="ulogo" />
            </div>
            <div className={`flex flex-row h-full`}>
                <div className="flex flex-col w-[15%] border-2">
                    <NavLink to="/" className={({ isActive }) => {
                        return isActive ? activeClassName : inactiveClassName
                    }}>Dashboard</NavLink>
                    <NavLink to="threads" className={({ isActive }) => {
                        return isActive ? activeClassName : inactiveClassName
                    }}>Threads</NavLink>
                    <NavLink to="settings" className={({ isActive }) => {
                        return isActive ? activeClassName : inactiveClassName
                    }}>Settings</NavLink>
                </div>

                <div className="p-10 border-2 w-[85%]">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}