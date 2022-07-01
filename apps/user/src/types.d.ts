export type confirmSignUpState = {
    email: string,
    password: string
}

export interface User{
    email: string,
    name: string
}
export interface School {
    name: string,
    email: string
}

export interface Thread {
    tid: string,
    name: string,
    messages: Map<string,Message>,
    from: string,
    fromtype: string,
    to: string,
    allocated: string,
    allocated_type: string,
    terminated: boolean,
}
export interface Message {
    timestamp: string,
    message: string,
    owner: string,
    tid: string,
    mid: string
}

interface Store {
    user: User,
    schools: School[],
    sendJsonMessage?: Function,
    threads: Map<string,Thread>,
    fetchedThreads: boolean,
    fetchedSchools: boolean,
    setSendJsonMessageFunction(cb: Function): void,
    getSchools(again: boolean): Promise<void>,
    setUserInfo(): Promise<void>,
    getThreads(again: boolean): Promise<void>,
    addThread(thread: Thread): void,
    addMessage(message: Message): void
    terminateThread(threadId: string): void,
    deleteThread(threadId: string): void
    deleteStore(): void
};

