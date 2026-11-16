import { Outlet } from 'react-router';
import Header from '../components/Header';
function AuthLayout() {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <Header />
      <Outlet />
    </div>
  );
}

export default AuthLayout;
