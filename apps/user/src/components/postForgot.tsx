import { ChangeEvent, FormEvent, useState,useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
export default function PostForgot() {
    const navigate = useNavigate()
    const location = useLocation()
    const email = `${location.state}`

    useEffect(() => {
        if(email == 'null'){
            console.log('true')
            navigate('/signin',{replace: true})
        }    
    },[])
    
    const [inputs, setInputs] = useState({
        "password": "",
        "code": "",
    })
    function onInputChange(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setInputs({ ...inputs, [event.target.name]: event.target.value })
    }

    function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        console.log(inputs)
    }
    return (
        <div className="flex items-center flex-col justify-center min-h-screen bg-gray-100">
            <img src="../../public/ulogo.jpg" className="w-16" alt="" />
            <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg">
                <h3 className="text-2xl font-bold text-center">Reset Password</h3>
                <form className="mt-4" onSubmit={onSubmit}>
                    <div>
                        <label htmlFor="email" className="block">Email</label>
                        <input type="email" name="email" placeholder="Email" id="email" value={email} readOnly className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" />
                    </div>
                    <div>
                        <div>
                            <label htmlFor="code" className="block">Confirmation Code</label>
                            <input type="password" name="code" placeholder="code" id="code" className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" onChange={onInputChange} />
                        </div>
                        <div>
                            <label htmlFor="password" className="block">New Password</label>
                            <input type="password" name="password" placeholder="password" id="password" className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" onChange={onInputChange} />
                        </div>
                    </div>

                    <div className="flex items-baseline justify-between">
                        <button type="submit" className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900">Confirm</button>
                    </div>
                </form>
            </div>
        </div>
    )
}