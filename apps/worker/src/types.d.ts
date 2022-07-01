export type confirmSignUpState = {
    email: string,
    password: string
}

export interface Thread {
    tid: string,
    name: string,
    messages: Map<string, Message>,
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

export interface Worker {
    email: string,
    semail: string
}

export interface Store {
    worker?: Worker,
    sendJsonMessage?: Function,
    threads: Map<string,Thread>,
    fetchedThreads: boolean,
    setWorkerInfo(): Promise<void>,
    setSendJsonMessageFunction(cb: Function): void,
    getThreads(again: boolean): Promise<void>,
    addMessage(message: Message): void,
    addThread(thread: Thread): void,
    terminateThread(threadId: string): void,
    deleteStore(): void
};
