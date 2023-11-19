import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from './pages/Home' 
import Profile from './pages/Profile' 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile/:username" element={<Profile />} />
        {/* <Route path="/accounts/create" element={<CreateAccountPage />} />
        <Route path="/accounts/profile/:username" element={<ProfilePage />} />
        <Route path="/posts" element={<ViewPosts />} />
        <Route path="/posts/:id" element={<PostPage />} />
        <Route path="/posts/create" element={<CreatePostPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App
