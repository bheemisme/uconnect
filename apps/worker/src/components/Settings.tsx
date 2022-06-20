import { Link } from "react-router-dom";

export default function Settings() {
    return (

        <ul className="w-full">
            <li className="py-4 px-2 w-full hover:cursor-pointer hover:text-sky-200 ">
                <Link to="/">Edit your Profile</Link>
            </li>
            <li className="py-4 px-2 w-full hover:cursor-pointer hover:text-sky-200 ">Change Password</li>
            <li className="py-4 px-2 w-full hover:cursor-pointer hover:text-sky-200 ">
                <Link to="/delete">Delete Your Account</Link>
            </li>
            <li className="py-4 px-2 w-full hover:cursor-pointer hover:text-sky-200">SignOut</li>
        </ul>
    )
}