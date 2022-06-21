import { useState, ChangeEvent, FormEvent,useEffect } from "react"
import { Auth } from "aws-amplify"
import { Link, useNavigate } from "react-router-dom"
import {ImCross} from 'react-icons/im'
import {IconContext} from 'react-icons'
import ulogo from '/ulogo.jpg'
export default function SignUp() {
    useEffect(() => {
        Auth.currentSession().then(() => {
            navigate('/')
        }).catch(() => {})
    },[])

    const [errorMessage,setErrorMessage] = useState("")
    const [inputs, setInputs] = useState({
        "username": "",
        "password": "",
        "email": ""
    })

    const navigate = useNavigate()

    function onInputChange(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setInputs({ ...inputs, [event.target.name]: event.target.value })
    }

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        try{
            await Auth.signUp({
                username: inputs.email,
                password: inputs.password,
                attributes: {
                    name: inputs.username
                }
            })
            navigate('/confirm',{
                replace: true,
                state: JSON.stringify({'email': inputs.email,'password': inputs.password})
            })    
        }catch(err){
            console.log(err)
            setErrorMessage("Error Creating account")
        }
        
        
        // sigup in logic
    }

    return (
        <div className="flex items-center flex-col justify-center min-h-screen bg-gray-100">
            <img src={ulogo} className="w-16" alt="" />
            <p className={`mt-4 p-2 rounded-2xl bg-red-300 text-white ${errorMessage.length==0 ? 'hidden': ''}`}>
            {errorMessage}
            <IconContext.Provider value={{className: "inline ml-2 w-3 hover:cursor-pointer"}}>
                <ImCross onClick={() => {
                    setErrorMessage("")
                }}/>
            </IconContext.Provider>
            </p>
            <div className="w-[40%] px-8 py-6 mt-4 text-left bg-white shadow-lg">
                <h3 className="text-2xl font-bold text-center">Create your account</h3>
                <form action="" onSubmit={onSubmit}>
                    <div className="mt-4">
                        <div>
                            <label htmlFor="email" className="block">School Email</label>
                            <input type="email" name="email" placeholder="school email" id="email" className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" value={inputs.email} onChange={onInputChange} />
                        </div>
                        <div>
                            <label htmlFor="username" className="block">School name</label>
                            <input type="text" name="username" placeholder="school username" id="username" className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" value={inputs.username} onChange={onInputChange} />
                        </div>

                        <div>
                            <label htmlFor="password" className="block">Password</label>
                            <input type="password" name="password" id="password" placeholder="password" className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" value={inputs.password} onChange={onInputChange} />
                        </div>
                        <div className="flex items-baseline justify-between">
                            <button type="submit" className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900">Sign in</button>
                        </div>
                        <div className="mt-2">
                            <Link to="/signin" className="text-sm text-blue-600 hover:underline">Already have an account? Sign In</Link>
                        </div>
                    </div>
                    
                </form>
            </div>

        </div>
    )
}

