import { Link, useNavigate } from "react-router-dom";
import { Auth } from "aws-amplify";
import { MouseEvent, useEffect } from "react";
import { useStore } from "../store";
import shallow from "zustand/shallow";
export default function Settings() {
    const navigate = useNavigate()
    const [user,deleteStore] = useStore((state) => [state.user,state.deleteStore], shallow)
    const onSignOut = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        Auth.signOut().then(obj => {
            navigate('/signin', { replace: true })
        }).catch(err => {
            navigate('/', { replace: true })
        })
    }

    // async function deleteUser(email: string) {

    //     try {
    //         const session = await Auth.currentSession()

    //         await fetch(`${import.meta.env.VITE_API_END_POINT}/deleteuser`, {
    //             'method': 'POST',
    //             'body': JSON.stringify({
    //                 'email': email,
    //             }),
    //             'headers': {
    //                 'authorization': session.getAccessToken().getJwtToken(),
    //                 'content-type': 'application/json'
    //             }
    //         })

    //         await Auth.deleteUser()
    //         navigate('/signin', { replace: true })
    //     } catch (error) {
    //         console.log(error)
    //         navigate('/settings', { replace: true })
    //     }

    // }

    
    const onDelete = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()

        try {
            const session = await Auth.currentSession()

            const res =await fetch(`${import.meta.env.VITE_API_END_POINT}/deleteuser`, {
                'method': 'POST',
                'body': JSON.stringify({
                    'email': user.email,
                }),
                'headers': {
                    'authorization': session.getAccessToken().getJwtToken(),
                    'content-type': 'application/json'
                }
            })
            const output = await res.json()

            if(output.error){
                throw new Error("bad request");
            }

            await Auth.deleteUser()
            
            deleteStore()
            navigate('/signin', { replace: true })
        } catch (error) {
            console.log(error)
            navigate('/settings', { replace: true })
        }

    }

    return (

        <ul className="w-full">
            <li className="py-4 px-2 w-full hover:cursor-pointer hover:text-sky-200 ">
                <Link to="/edit">Edit your Profile</Link>
            </li>
            <li className="py-4 px-2 w-full hover:cursor-pointer hover:text-sky-200 ">
                <Link to="/change">Change Password</Link>
            </li>
            <li className="py-4 px-2 w-full ">
                <button className=" p-2 rounded-2xl text-white bg-sky-200 hover:bg-sky-400 hover:cursor-pointer" onClick={onSignOut}>SignOut</button>
            </li>
            <li className="py-4 px-2 w-full ">
                <button className=" p-2 rounded-2xl text-white bg-sky-200 hover:bg-sky-400 hover:cursor-pointer" onClick={onDelete}>Delete</button>
            </li>
        </ul>
    )
}