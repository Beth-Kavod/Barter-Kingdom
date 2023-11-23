import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from './pages/Home' 
import Profile from './pages/Profile' 
import Signup from './pages/Signup'
import Login from './pages/Login'
import Tribes from './pages/Tribes'
import SingleTribe from './pages/SingleTribe';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/Tribes" element={<Tribes />} />
        <Route path="/Tribes/:Tribe" element={<SingleTribe />} />
        <Route path="/profile/:username" element={<Profile />} />
        {/* <Route path="/accounts/create" element={<CreateAccountPage />} />
        <Route path="/accounts/profile/:username" element={<ProfilePage />} />
        <Route path="/posts" element={<ViewPosts />} />
        <Route path="/posts/:id" element={<PostPage />} />
        <Route path="/posts/create" element={<CreatePostPage />} /> */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App
