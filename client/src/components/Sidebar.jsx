function Sidebar({
  user,
  logoutHandler,
  modalHandler,
  otherUsers,
  selectRoomHandler,
  userStatuses,
}) {
  return (
    <aside className="w-72 shrink-0 min-h-screen flex flex-col gap-4 border-r border-slate-300 bg-white">
      {/* User Profile Header */}
      <div className="flex justify-between items-center gap-3 bg-purple-500 p-3 text-white">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-12 h-12 border-2 border-white/70 rounded-full overflow-hidden shrink-0 bg-purple-300">
            <img
              src={user?.avatar}
              alt={user?.fullName || 'User avatar'}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 id="user-name" className="font-bold text-sm truncate">
              {user?.fullName}
            </h1>
            <p id="user-username" className="text-xs text-purple-100 truncate">
              @{user?.username}
            </p>
          </div>
        </div>

        <button
          id="logout-button"
          type="button"
          onClick={logoutHandler}
          className="px-2.5 py-1 text-xs font-medium bg-red-500 text-white rounded-md hover:bg-red-600 hover:shadow-md transition-all duration-200 cursor-pointer shrink-0 outline-none"
        >
          Logout
        </button>
      </div>

      {/* New Chat Trigger */}
      <div className="px-3">
        <button
          id="new-chat-button"
          type="button"
          onClick={modalHandler}
          className="w-full py-2 px-3 bg-blue-600 text-white text-sm font-medium rounded-md cursor-pointer hover:bg-blue-700 hover:shadow-lg transition-all duration-200"
        >
          + New Chat
        </button>
      </div>

      {/* Recent Chats List */}
      <div className="w-full flex flex-col flex-1 border-t border-slate-200 px-3 py-2 gap-4">
        <p className="text-xs font-semibold tracking-wider text-slate-500">
          RECENT CHATS
        </p>
        <div className="w-full flex-1 flex flex-col text-slate-400 text-sm gap-1">
          <div
            className={`text-center ${otherUsers.length > 0 ? 'hidden' : 'block'}`}
          >
            <p className="font-medium text-slate-500">No conversations</p>
            <p className="text-xs">Search for a user to start chatting</p>
          </div>
          <div
            className={`${otherUsers.length > 0 ? 'block' : 'hidden'} w-full`}
          >
            {otherUsers.map((u) => (
              <button
                key={u.otherUser?._id || u.room}
                id={`room-${u.room}`}
                onClick={() => {
                  selectRoomHandler(u);
                }}
                className="w-full flex text-left justify-between items-center gap-4 border p-3 rounded-sm hover:shadow-xl transition-all duration-300 relative"
              >
                <div className="w-full flex justify-center items-center gap-1">
                  <div className="size-10 border rounded-full overflow-hidden shrink-0 border-white">
                    <img className="object-cover" src={u.otherUser?.avatar} />
                  </div>
                  <div className="w-full flex flex-col">
                    <p className="text-black text-lg">
                      {u.otherUser?.fullName || 'Chat'}
                    </p>
                    <p className="text-xs">
                      {u.otherUser?._id &&
                      userStatuses?.[u.otherUser._id]?.online
                        ? 'Online'
                        : u.otherUser?._id &&
                            userStatuses?.[u.otherUser._id]?.lastSeen
                          ? `Last seen ${new Date(
                              userStatuses[u.otherUser._id].lastSeen
                            ).toLocaleString()}`
                          : 'Offline'}
                    </p>
                  </div>
                </div>

                <p className="top-1.5 right-1.5 absolute">12:45</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
