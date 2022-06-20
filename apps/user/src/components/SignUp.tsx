import { useState, ChangeEvent, FormEvent } from "react"


export default function SignUp() {
    const [inputs, setInputs] = useState({
        "username": "",
        "password": "",
        "email": ""
    })

    function onInputChange(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setInputs({ ...inputs, [event.target.name]: event.target.value })
    }

    function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        console.log(inputs)
        // sigup in logic
    }

    return (
        <div className="flex items-center flex-col justify-center min-h-screen bg-gray-100">
            <img src="../../public/ulogo.jpg" className="w-16" alt="" />
            <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg">
                <h3 className="text-2xl font-bold text-center">Create your account</h3>
                <form action="" onSubmit={onSubmit}>
                    <div className="mt-4">
                        <div>
                            <label htmlFor="email" className="block">Email</label>
                            <input type="email" name="email" placeholder="Email" id="email" className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" value={inputs.email} onChange={onInputChange} />
                        </div>
                        <div>
                            <label htmlFor="username" className="block">Username</label>
                            <input type="text" name="username" placeholder="Username" id="username" className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" value={inputs.username} onChange={onInputChange} />
                        </div>

                        <div>
                            <label htmlFor="password" className="block">Password</label>
                            <input type="password" name="password" id="password" placeholder="Password" className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" value={inputs.password} onChange={onInputChange} />
                        </div>
                        <div className="flex items-baseline justify-between">
                            <button type="submit" className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900">Sign in</button>
                            
                        </div>
                    </div>
                    
                </form>
            </div>

        </div>
    )
}

