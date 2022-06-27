import { useReducer } from "react"

export type confirmSignUpState = {
    email: string,
    password: string
}

type message = {
    msg: string,
    tid: string,
    from: string,
    to: string
}
type  worker = {}
type thread = {}
type school = {}
type State = {
    threads: Map<thread,message[]>,
    workers: Array<worker>,
    schools: Array<school>,
}


let initialState: State = {
    threads: new Map<thread,message[]>(),
    workers: new Array<worker>(),
    schools: new Array<school>()
}

enum actionType {
    NEWTHREAD,
    TERMINATETHREAD,
    NEWWORKER,
    NEWSCHOOL,
    NEWMESSAGE,
    DELETEWORKER,
    DELETESCHOOL
}

type NEWTHREAD = {
    type: 'NEWTHREAD',
    payload: thread
}

type TERMINATETHREAD = {
    type: 'TERMINATETHREAD',
    payload: thread
}

type NEWWORKER = {
    type: 'NEWWORKER',
    payload: worker
}

type NEWMESSAGE = {
    type: 'NEWMESSAGE',
    payload: message
}

