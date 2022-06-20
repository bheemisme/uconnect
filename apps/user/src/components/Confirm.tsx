import { ChangeEvent, FormEvent, useState } from "react"

export default function Confirm() {
    const [inputs, setInputs] = useState({
        "code": ""
    })

    function onInputChange(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setInputs({ ...inputs, [event.target.name]: event.target.value })
    }

    function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        console.log(inputs)
        // confirm logic
    }


    return (
        <div className="flex items-center flex-col justify-center min-h-screen bg-gray-100">
            <img src="../../public/ulogo.jpg" className="w-16" alt="" />
            <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg">
                <form onSubmit={onSubmit} className="mt-4">

                    <div>
                        <label htmlFor="code" className="block">Confirmation Code</label>
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
