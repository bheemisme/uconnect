import { Link, useNavigate } from "react-router-dom";
import { Auth } from "aws-amplify";
import { MouseEvent } from "react";
export default function Settings() {
    const navigate = useNavigate()
    const onSignOut = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        Auth.signOut().then(obj => {
            navigate('/signin', { replace: true })
        }).catch(err => {
            navigate('/', { replace: true })
        })
    }

    const onDelete = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        Auth.deleteUser().then(user => {
            console.log(user)
            navigate('/signin', { replace: true })
        })
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
        </ul>
    )
}