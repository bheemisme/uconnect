import { Auth } from "aws-amplify"
import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
export default function Dashboard() {

    const navigate = useNavigate()
    const [school, setSchool] = useState({
        sname: "",
        semail: ""
    })
    const [workers, addWorkers] = useState<{email: string,status: string}[]>([])

    let worker_items = workers.map((wrk: {email: string,status: string},index:number) => {
        return (<li key={index}>{wrk.email} {"-->"} {wrk.status === 'CONFIRMED' ? 'CONFIRMED': 'UNCONFIRMED'}<button className="mt-4 px-2 text-white bg-sky-400 rounded-xl"  onClick={async (event) => {
            event.preventDefault()
            try {
                const token = (await Auth.currentSession()).getAccessToken().getJwtToken()
                const res = await fetch('https://9klt3hok77.execute-api.ap-south-1.amazonaws.com/uconnect/deleteworker', {
                    method: 'POST',
                    body: JSON.stringify({
                        'email': wrk.email
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                })
            } catch (err) {
                
                    navigate('/signin',{replace: true})
                
            }
        }}>Delete</button></li>)
    })

    useEffect(() => {

        Auth.currentAuthenticatedUser().then(scl => {
            
            Auth.currentSession().then(session => {
                fetch(`https://9klt3hok77.execute-api.ap-south-1.amazonaws.com/uconnect/getworkers`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.getAccessToken().getJwtToken()}`,
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        'email': scl.attributes.email
                    })
                }).then(res => res.json()).then(workers =>{
                    addWorkers(workers.workers)
                }).catch(err => {
                    console.log(err)
                })
            })

            setSchool({
                sname: scl.attributes.name,
                semail: scl.attributes.email
            })
            
        }).catch(() => {
            navigate('/signin',{replace: true})
        })

        

    }, [])



    const [inputs, setInputs] = useState<{wemail: string}>({
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
        try {
            const token = (await Auth.currentSession()).getAccessToken().getJwtToken()
            const res = await fetch('https://9klt3hok77.execute-api.ap-south-1.amazonaws.com/uconnect/addworker', {
                method: 'POST',
                body: JSON.stringify({
                    semail: school.semail,
                    email: inputs.wemail
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            })

            workers.push({'email': inputs.wemail,'status': 'UNCONFIRMED'})
            addWorkers([... workers])
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div>
            <h1 className="text-xl font-bold">{school.sname.toUpperCase()}</h1>
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
                <ul>
                    {worker_items}
                </ul>
            </div>
        </div>
    )
}