import { BrowserRouter as Router, Route, Routes,Navigate } from 'react-router-dom'
import Forgot from './components/Forgot'
import Home from './components/Home'
import SignUp from './components/SignUp'
import SignIn from './components/SignIn'
import PostForgot from './components/postForgot'
import Settings from './components/Settings'
import {Threads,Chat} from './components/Threads'
import Delete from './components/Delete'
import { Amplify } from 'aws-amplify'
import Change from './components/Change'
import Dashboard from './components/Dashboard'
Amplify.configure({
  Auth: {
    region: import.meta.env.VITE_REGION,
    userPoolId: import.meta.env.VITE_POOL_ID,
    userPoolWebClientId: import.meta.env.VITE_CLIENT_ID,
    authenticationFlowType: import.meta.env.VITE_AUTH_FLOW_TYPE,
  }
})


function App() {



  return (
    <Router>
      <Routes>

        <Route path='signup' element={<SignUp />} />
        <Route path='signin' element={<SignIn />}/>
        <Route path='forgot' element={<Forgot />} />
        <Route path='postforgot' element={<PostForgot />} />
        <Route path='/' element={<Home />}>
          <Route index element={<Dashboard />} />
          <Route path='settings' element={<Settings />} />
          <Route path='threads' element={<Threads />} >
              <Route path=':tid' element={<Chat  />} />
          </Route>
          <Route path='change' element={<Change />} />
          <Route path='delete' element={<Delete />} />
          <Route path='*' element={<Navigate replace to="/"/>} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
