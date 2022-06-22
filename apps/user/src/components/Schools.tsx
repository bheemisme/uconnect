export default function Schools() {
    // fetch all schools
    
    return (
        <div className="flex flex-row flex-wrap">
            <button onClick={(e) => {
                e.preventDefault()
                // add the new thread from our school to this school
            }} className="border-2 rounded-2xl p-2 ml-4 mb-4 w-30 hover:cursor-pointer hover:text-white hover:bg-sky-400">
                School 1
            </button>
            <button onClick={(e) => {
                e.preventDefault()
            }} className="border-2 rounded-2xl p-2 ml-4 mb-4 w-30 hover:cursor-pointer hover:text-white hover:bg-sky-400">
                School 3
            </button>
            <button onClick={(e) => {
                e.preventDefault()
            }} className="border-2 rounded-2xl p-2 ml-4 mb-4 w-30 hover:cursor-pointer hover:text-white hover:bg-sky-400">
                School 4
            </button>

        </div>
    )
}