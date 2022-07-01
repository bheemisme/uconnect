import { Auth } from "aws-amplify"
import { ChangeEvent, FormEvent, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ImCross } from 'react-icons/im'
import { IconContext } from 'react-icons'

export default function EditProfile() {

    
    const [inputs, setInputs] = useState({
        "username": ""
    })
    const [msg, setMsg] = useState({
        message: "",
        error: false
    })

    function onInputChange(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setInputs({ ...inputs, [event.target.name]: event.target.value })
    }

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const currentUser = await Auth.currentUserPoolUser()
        try {
            await Auth.updateUserAttributes(currentUser, {
                name: inputs.username
            })
            setMsg({
                message: "Profile Updated",
                error: false
            })
        } catch (err) {
            setMsg({
                message: "Error Updating Profile",
                error: true
            })
        }

    }

    return (
        <div>
            <p className={`mt-4 p-2 rounded-2xl bg-red-300 text-white  ${msg.message.length == 0 ? 'hidden' : msg.error ? 'bg-red-300' : 'bg-green-300'}`}>
                {msg.message}
                <IconContext.Provider value={{ className: "inline ml-2 w-3 hover:cursor-pointer" }}>
                    <ImCross onClick={() => {
                        setMsg({
                            message: "", error: false
                        })
                    }} />
                </IconContext.Provider>
            </p>
            <form onSubmit={onSubmit}>
                <label htmlFor="username">school name: </label>
                <input type="text" id="username" name="username" onChange={onInputChange} value={inputs.username} className="border-2 focus:outline-none px-2" />
                <button className="block border-2 p-2 px-4 rounded-2xl bg-sky-300 text-white">Edit</button>
            </form>
        </div>
    )
}