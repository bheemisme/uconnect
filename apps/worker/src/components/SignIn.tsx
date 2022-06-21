import { useState, ChangeEvent, FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Auth } from 'aws-amplify'
import ulogo from '/ulogo.jpg'
import {ImCross} from 'react-icons/im'
import {IconContext} from 'react-icons'
export default function SignIn() {
    const [inputs, setInputs] = useState({
        "password": "",
        "email": "",
        "temppassword": ""
    })
    const [errorMessage,setErrorMessage] = useState("")
    
    function onInputChange(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setInputs({ ...inputs, [event.target.name]: event.target.value })
    }

    const navigate = useNavigate()
    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        try {
            let user = await Auth.signIn(inputs.email, inputs.temppassword)
            await Auth.completeNewPassword(user, inputs.password)
            navigate('/', { replace: true })
        } catch (err) {
            setErrorMessage("email or password might be incorrect")
        }
    }

    

    return (
        <div className="flex items-center flex-col justify-center min-h-screen bg-gray-100">
            <img src={ulogo} className="w-16" alt="" />
            <div className="px-8 py-6 mt-4 w-[40%] text-left bg-white shadow-lg">
                <h3 className="text-2xl font-bold text-center">Signin</h3>
                <p className={`mt-4 p-2 rounded-2xl bg-red-300 text-white ${errorMessage.length == 0 ? 'hidden' : ''}`}>
                    {errorMessage}
                    <IconContext.Provider value={{ className: "inline ml-2 w-3 hover:cursor-pointer" }}>
                        <ImCross onClick={() => {
                            setErrorMessage("")
                        }} />
                    </IconContext.Provider>
                </p>

                <form action="" onSubmit={onSubmit}>
                    <div className="mt-4">
                        <div>
                            <label htmlFor="email" className="block">Email</label>
                            <input type="email" name="email" placeholder="Email" id="email" className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" value={inputs.email} onChange={onInputChange} />
                        </div>
                        <div>
                            <label htmlFor="password" className="block">Temperaroy Password</label>
                            <input type="password" name="temppassword" id="temppassword" placeholder="temperaroy password" className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" value={inputs.temppassword} onChange={onInputChange} />
                        </div>
                        <div>
                            <label htmlFor="password" className="block">New Password</label>
                            <input type="password" name="password" id="password" placeholder="new password" className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" value={inputs.password} onChange={onInputChange} />
                        </div>
                        <div className="flex items-baseline justify-between">
                            <button type="submit" className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900">Sign in</button>
                            <Link to="/forgot" className="text-sm text-blue-600 hover:underline">Forgot password?</Link>
                        </div>
                    </div>
                </form>
            </div>

        </div>
    )
}
