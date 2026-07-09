import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Directory from './pages/Directory';
import Feed from './pages/Feed';
import Forum from './pages/Forum';
import ForumThreadPage from './pages/ForumThreadPage';
import Connections from './pages/Connections';
import Messages from './pages/Messages';
import Conversation from './pages/Conversation';
import Jobs from './pages/Jobs';
import Events from './pages/Events';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

// Wraps a page with the shared sidebar/topbar chrome
const withLayout = (Component) => (
  <AppLayout>
    <Component />
  </AppLayout>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<ProtectedRoute>{withLayout(Dashboard)}</ProtectedRoute>} />
      <Route path="/directory" element={<ProtectedRoute>{withLayout(Directory)}</ProtectedRoute>} />
      <Route path="/feed" element={<ProtectedRoute>{withLayout(Feed)}</ProtectedRoute>} />
      <Route path="/forum" element={<ProtectedRoute>{withLayout(Forum)}</ProtectedRoute>} />
      <Route path="/forum/:id" element={<ProtectedRoute>{withLayout(ForumThreadPage)}</ProtectedRoute>} />
      <Route path="/connections" element={<ProtectedRoute>{withLayout(Connections)}</ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute>{withLayout(Messages)}</ProtectedRoute>} />
      <Route path="/messages/:userId" element={<ProtectedRoute>{withLayout(Conversation)}</ProtectedRoute>} />
      <Route path="/jobs" element={<ProtectedRoute>{withLayout(Jobs)}</ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute>{withLayout(Events)}</ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute>{withLayout(Profile)}</ProtectedRoute>} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>{withLayout(Admin)}</ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
