import { useEffect, useState } from "react"
import { NavLink, Outlet } from "react-router-dom"
import { Auth } from "aws-amplify"
export default function Home() {
    
    return (
        <div className="h-screen flex flex-col">
            <div className="font-bold  flex flex-row justify-center border-2 h-[10%]">
                <img src="/ulogo.jpg" className="w-14" alt="ulogo" />
            </div>
            <div className={`flex flex-row h-full`}>
                <div className="flex flex-col w-[15%] border-2">
                    <NavLink to="/" className="p-4 hover:text-white hover:bg-sky-300 hover:cursor-pointer">Dashboard</NavLink>

                    <NavLink to="schools" className={"p-4 hover:text-white hover:bg-sky-300 hover:cursor-pointer"}>Schools</NavLink>


                    <NavLink to="threads" className={"p-4 hover:text-white hover:bg-sky-300 hover:cursor-pointer"}>Threads</NavLink>


                    <NavLink to="settings" className={"p-4 hover:text-white hover:bg-sky-300 hover:cursor-pointer"}>Settings</NavLink>

                </div>

                <div className="p-10 border-2 w-[85%]">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}