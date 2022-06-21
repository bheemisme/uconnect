import { Auth, Amplify } from "aws-amplify"
import { ChangeEvent, FormEvent, useEffect, useState } from "react"
export default function Dashboard() {
    let school: any
    const [sname,setName] = useState("")


    Auth.currentAuthenticatedUser().then(usr => {
        school = usr
        setName(school.attributes.name)
    })

    

    const [inputs, setInputs] = useState({
        wemail: ''
    })

    function onInputChange(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setInputs({
            ...inputs,
            [event.target.name]: event.target.value
        })
    }

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        fetch('https://qqzyfskcae.execute-api.ap-south-1.amazonaws.com/addworker',{
            method: 'POST',
            body: JSON.stringify({
                semail: school.attributes.email,
                email: inputs.wemail
            }),
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${school.signInUserSession.accessToken}`,
                
            }
        }).then(res => {
            console.log(res)
        }).catch(err => {
            console.log(err)
        })
    }

    return (
        <div>
            <h1 className="text-xl font-bold">{sname.toUpperCase()}</h1>
            <div>
                <h3 className="mt-4 text-lg">Add A Worker</h3>
                <form onSubmit={onSubmit} >
                    <label htmlFor="wemail" className="text-sm">Worker Email: </label>
                    <input type="email" id="wemail" value={inputs.wemail} className="mt-4 border-2 px-2" name="wemail" onChange={onInputChange} />
                    <button className="mt-4 block p-2 bg-sky-400 text-white rounded-3xl">Submit</button>
                </form>
            </div>
            <div>
                <h3 className="mt-4 text-sm">Workers list</h3>
            </div>
        </div>
    )
}