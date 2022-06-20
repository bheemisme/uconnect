import { useState, ChangeEvent, FormEvent, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Auth } from "aws-amplify"
import { ImCross } from 'react-icons/im'
import { IconContext } from 'react-icons'
export default function SignIn() {
    const navigate = useNavigate()
    useEffect(() => {
        Auth.currentSession().then(() => {
            navigate('/')
        }).catch(() => { })
    }, [])
    const [errorMessage, setErrorMessage] = useState("")
    const [inputs, setInputs] = useState({
        "password": "",
        "email": ""
    })

    function onInputChange(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setInputs({ ...inputs, [event.target.name]: event.target.value })
    }

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        console.log(inputs)
        try {
            await Auth.signIn(inputs.email, inputs.password)
            navigate('/', {
                replace: true
            })
        } catch (err) {
            setErrorMessage('Email or Passowrd incorrect')
        }
    }


    return (
        <div className="flex items-center flex-col justify-center min-h-screen bg-gray-100">
            <img src="/ulogo.jpg" className="w-16" alt="" />
            <p className={`mt-4 p-2 rounded-2xl bg-red-300 text-white ${errorMessage.length == 0 ? 'hidden' : ''}`}>
                {errorMessage}
                <IconContext.Provider value={{ className: "inline ml-2 w-3 hover:cursor-pointer" }}>
                    <ImCross onClick={() => {
                        setErrorMessage("")
                    }} />
                </IconContext.Provider>
            </p>
            <div className="w-[40%] px-8 py-5 mt-4 text-left bg-white shadow-lg">
                <h3 className="text-2xl font-bold text-center">Signin</h3>
                <form onSubmit={onSubmit}>
                    <div className="mt-4">
                        <div>
                            <label htmlFor="email" className="block">Email</label>
                            <input type="email" name="email" placeholder="Email" id="email" className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" value={inputs.email} onChange={onInputChange} />
                        </div>
                        <div>
                            <label htmlFor="password" className="block">Password</label>
                            <input type="password" name="password" id="password" placeholder="Password" className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" value={inputs.password} onChange={onInputChange} />
                        </div>
                        <div className="flex items-baseline justify-between">
                            <button type="submit" className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900">Sign in</button>
                            <Link to="/forgot" className="text-sm text-blue-600 hover:underline">Forgot password?</Link>
                        </div>
                        <div className="mt-2">
                            <Link to="/signup" className="text-sm text-blue-600 hover:underline">Don't have an account? Signup</Link>
                        </div>
                    </div>
                </form>
            </div>

        </div>
    )
}
