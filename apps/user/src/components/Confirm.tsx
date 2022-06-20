import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import { Auth } from "aws-amplify"
import { useNavigate, useLocation } from "react-router-dom"
import { confirmSignUpState } from "../types"
import ulogo from '/ulogo.jpg'
export default function Confirm() {
    const [inputs, setInputs] = useState({
        "code": ""
    })

    
    const navigate = useNavigate()
    const location = useLocation()
    useEffect(() => {
        if(typeof location.state !== 'string'){
            navigate('/signup',{replace: true})
        }
    },[])

    function onInputChange(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setInputs({ ...inputs, [event.target.name]: event.target.value })
    }

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (typeof location.state === 'string') {
            let obj: confirmSignUpState = JSON.parse(location.state)
            try {
                await Auth.confirmSignUp(obj.email, inputs.code)
                await Auth.signIn(obj.email, obj.password)
                navigate('/', { replace: true })
            } catch (error) {  
                navigate('/signup', { replace: true })    
            }

        } else {
            navigate('/signup', { replace: true })
        }

    }


    return (
        <div className="flex items-center flex-col justify-center min-h-screen bg-gray-100">
            <img src={ulogo} className="w-16" alt="" />
            
            <div className="px-8 py-6 mt-4 w-[40%] text-left bg-white shadow-lg">
                
                <form onSubmit={onSubmit} className="mt-4">
                    <div>
                        <label htmlFor="code" className="block">Confirmation Code</label>
                        <p className="text-sm mt-4 text-gray-400 italic lowercase">enter confirmation code sent to your email</p>
                        <input type="password" name="code" id="code" placeholder="Code" className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" value={inputs.code} onChange={onInputChange} />
                    </div>
                    <div className="flex items-baseline justify-between">
                        <button type="submit" className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900">Confirm</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
