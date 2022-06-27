import { Auth } from "aws-amplify"
import { ChangeEvent, FormEvent, useState } from "react"
import { ImCross } from 'react-icons/im'
import { IconContext } from 'react-icons'

export default function Change() {
    const [inputs, setInputs] = useState({
        opassword: "",
        npassword: ""
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
        try {
            let user = await Auth.currentAuthenticatedUser()
            await Auth.changePassword(user, inputs.opassword, inputs.npassword)
            setMsg({
                message: "password updated success fully",
                error: false
            })

            setInputs({opassword: "",npassword: ""})
        } catch (err) {
            setMsg({
                message: "Check Your Old Password",
                error: true
            })
        }
    }
    return (
        <div>
            <p className={`my-4 p-3 rounded-2xl bg-red-300 text-white  ${msg.message.length == 0 ? 'hidden' : msg.error ? 'bg-red-300' : 'bg-green-300'}`}>
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
                <div className="p-3">
                    <label htmlFor="opassword">Old Password: </label>
                    <input type="password" id="opassword" className="border-2 rounded-xl px-2 " value={inputs.opassword} placeholder="old password" name="opassword" onChange={onInputChange} />
                </div>
                <div className="p-3">
                    <label htmlFor="npassword">New Password</label>
                    <input type="password" id="npassword" className="border-2 rounded-xl px-2 " value={inputs.npassword} placeholder="new password" name="npassword" onChange={onInputChange} />
                </div>

                <button type="submit" className="p-3 bg-sky-400 text-white rounded-2xl">Submit</button>

            </form>
        </div>
    )
}