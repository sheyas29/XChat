import { Link, NavLink } from 'react-router';

function Header() {
  return (
    <div className="w-full flex justify-between items-center border border-slate-200 gap-4 py-4 px-5 rounded-md shadow-md">
      <div className=" text-2xl text-white font-bold bg-pink-500 p-2 rounded-md">
        <Link to="/">XChat</Link>
      </div>
      <div className="flex items-center gap-4">
        <NavLink
          to="/register"
          className={({ isActive }) =>
            isActive
              ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }
        >
          Register
        </NavLink>
        <NavLink
          to="/login"
          className={({ isActive }) =>
            isActive
              ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }
        >
          Login
        </NavLink>
      </div>
    </div>
  );
}

export default Header;
