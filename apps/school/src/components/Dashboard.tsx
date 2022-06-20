import { Auth,Amplify } from "aws-amplify"
import { ChangeEvent, FormEvent, useState } from "react"
export default function Dashboard(){
    let user:any
    Auth.currentAuthenticatedUser().then(usr => {
        user = user
        console.log(user)
    })

    const [inputs,setInputs] = useState({
        wemail: '',
        
    })

    function onInputChange(e: ChangeEvent<HTMLInputElement>){
        e.preventDefault()
        setInputs({...inputs,
            [e.target.name]: e.target.value
        })
    }
    
    async function onSubmit(e: FormEvent<HTMLFormElement>){
        e.preventDefault()
        console.log(inputs.wemail)
    }
    return (
        <div>
            <h1 className="text-xl">Dashboard</h1>
            <div>
                <h3 className="mt-4 text-lg">Add A Worker</h3>
                <form action="" onSubmit={onSubmit} >
                    <label htmlFor="wemail" className="text-sm">Worker Email: </label>
                    <input type="email" id="wemail" value={inputs.wemail} className="mt-4 border-2 px-2" name="wemail" onChange={onInputChange}/>
                    <button className="mt-4 block p-2 bg-sky-400 text-white rounded-3xl">Submit</button>
                </form>
            </div>
            <div>
                <h3 className="mt-4 text-sm">Workers list</h3>
            </div>
        </div>
    )
}