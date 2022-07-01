import { Outlet, useNavigate, useParams} from 'react-router-dom'
import { Input } from './Input'
import { Display } from './Display'
import { ThreadList } from './ThreadList'




export function Chat() {
    
    return (
        <div className="border-2 p-2 w-[80%] flex flex-col-reverse rounded-2xl">
            <Input  />
            <Display />
        </div>
    )
}
export function Threads() {

    return (
        <div className="h-full rounded-2xl flex flex-row">
            <ThreadList />
            <Outlet />
        </div>
    )
}

