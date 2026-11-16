import { signOut } from 'firebase/auth';
import {
  onDisconnect,
  onValue,
  push,
  ref,
  serverTimestamp,
  set,
} from 'firebase/database';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import SearchModal from '../components/SearchModal';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/authContext';
import { auth, database } from '../firebase/firebase';

function Home() {
  const { user, setUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [allRooms, setAllRooms] = useState([]);
  const [otherUsers, setOtherUsers] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [otherUserStatus, setOtherUserStatus] = useState(null);
  const [userStatuses, setUserStatuses] = useState({});
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  useEffect(() => {
    if (!user?._id) return;

    const statusRef = ref(database, `status/${user._id}`);
    const connectedRef = ref(database, '.info/connected');

    const unsubscribe = onValue(connectedRef, async (snapshot) => {
      if (snapshot.val() === true) {
        await onDisconnect(statusRef).set({
          online: false,
          lastSeen: serverTimestamp(),
        });

        await set(statusRef, {
          online: true,
          lastSeen: serverTimestamp(),
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user?._id]);
  useEffect(() => {
    if (!selectedRoom?.otherUser?._id) {
      setOtherUserStatus(null);
      return;
    }

    const statusRef = ref(database, `status/${selectedRoom.otherUser._id}`);

    const unsubscribe = onValue(statusRef, (snapshot) => {
      setOtherUserStatus(snapshot.val());
    });

    return () => {
      unsubscribe();
    };
  }, [selectedRoom?.otherUser?._id]);
  useEffect(() => {
    if (!selectedRoom?.room || !selectedRoom?.otherUser?._id) {
      setIsOtherUserTyping(false);
      return;
    }

    const typingRef = ref(
      database,
      `typing/${selectedRoom.room}/${selectedRoom.otherUser._id}`
    );

    const unsubscribe = onValue(typingRef, (snapshot) => {
      setIsOtherUserTyping(snapshot.val()?.isTyping ?? false);
    });

    return () => {
      unsubscribe();
    };
  }, [selectedRoom?.room, selectedRoom?.otherUser?._id]);
  async function updateTypingStatus(isTyping) {
    if (!selectedRoom?.room || !user?._id) return;

    const typingRef = ref(database, `typing/${selectedRoom.room}/${user._id}`);

    await set(typingRef, {
      isTyping,
      timestamp: Date.now(),
    });
  }
  useEffect(() => {
    if (!selectedRoom?.room || !user?._id) return;

    const typingRef = ref(database, `typing/${selectedRoom.room}/${user._id}`);

    // If the input is empty, mark yourself as not typing.
    if (!messageInput.trim()) {
      set(typingRef, {
        isTyping: false,
        timestamp: Date.now(),
      });
      return;
    }

    // User has started typing.
    set(typingRef, {
      isTyping: true,
      timestamp: Date.now(),
    });

    // Mark as not typing after 1.5 seconds of inactivity.
    const timer = setTimeout(() => {
      set(typingRef, {
        isTyping: false,
        timestamp: Date.now(),
      });
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, [messageInput, selectedRoom?.room, user?._id]);
  useEffect(() => {
    const unsubscribes = otherUsers.map((u) => {
      const statusRef = ref(database, `status/${u.otherUser._id}`);

      return onValue(statusRef, (snapshot) => {
        setUserStatuses((prev) => ({
          ...prev,
          [u.otherUser._id]: snapshot.val(),
        }));
      });
    });

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [otherUsers]);
  // 1. Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchInput.trim());
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [searchInput]);

  // 2. Fetch users whenever the debounced search term changes
  useEffect(() => {
    const normalisedSearchTerm = searchInput.trim();

    // Don't search if the modal is closed, input is empty,
    // or the debounce hasn't caught up with the latest input.
    if (
      !isModalOpen ||
      !normalisedSearchTerm ||
      normalisedSearchTerm !== debouncedSearchTerm
    ) {
      setSearchResults([]);
      setSearchError('');
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchUsers() {
      try {
        setLoading(true);
        setSearchError('');

        const res = await axiosInstance.get('/users/search', {
          params: {
            searchTerm: debouncedSearchTerm,
          },
          signal: controller.signal,
        });

        // Only update results if this request hasn't been cancelled.
        if (!controller.signal.aborted) {
          setSearchResults(res.data.data);
        }
      } catch (err) {
        // Ignore intentional request cancellations.
        if (err.code !== 'ERR_CANCELED' && !controller.signal.aborted) {
          console.error('Search failed:', err);

          setSearchError(
            err.response?.data?.message ||
              'Unable to search users. Please try again.'
          );
        }
      } finally {
        // An older cancelled request must not change the
        // loading state of a newer request.
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchUsers();

    // Cancel the previous request when the effect is cleaned up.
    return () => {
      controller.abort();
    };
  }, [isModalOpen, searchInput, debouncedSearchTerm]);

  //3. Fetch all recent chat rooms
  useEffect(() => {
    async function fetchAllRooms() {
      try {
        const res = await axiosInstance.get('/rooms/userrooms');

        setAllRooms(res.data.data);
      } catch (err) {
        console.log(err);
      }
    }
    fetchAllRooms();
  }, []);

  //4. Listen to messages in firebase
  useEffect(() => {
    if (!selectedRoom?.room) {
      return;
    }
    const unsubscribe = onValue(
      ref(database, `messages/${selectedRoom.room}`),
      (snapshot) => {
        setMessages(
          Object.entries(snapshot.val() || {}).map((o) => ({
            id: o[0],
            content: o[1].content,
            senderId: o[1].senderId,
            timestamp: o[1].timestamp,
          }))
        );
      }
    );
    return () => {
      unsubscribe();
    };
  }, [selectedRoom?.room]);

  //5. Scroll effect changes whenever message state chnges
  useEffect(() => {
    const container = messagesContainerRef.current;

    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  async function logoutHandler() {
    try {
      const res = await axiosInstance.get('/users/logout');

      try {
        await signOut(auth);
      } catch (firebaseError) {
        console.error('Firebase sign-out failed:', firebaseError);
      }

      setUser(null);
      toast.success(res.data.message);
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message || 'Logout failed. Please try again.'
      );
    }
  }

  function openModalHandler() {
    setIsModalOpen(true);
  }

  const closeModalHandler = useCallback(() => {
    setIsModalOpen(false);
    setSearchInput('');
    setDebouncedSearchTerm('');
    setSearchResults([]);
    setSearchError('');
    setLoading(false);
  }, []);

  function searchInputHandler(e) {
    setSearchInput(e.target.value);
  }
  useEffect(() => {
    function getOtherUsers() {
      if (!user?._id) return;

      const others = allRooms.reduce((acc, ele) => {
        const room = ele._id;
        const otherUser =
          ele.users?.find((u) => u._id !== user._id) || ele.users?.[0];
        if (otherUser) {
          acc.push({ room: room, otherUser: otherUser });
        }
        return acc;
      }, []);

      setOtherUsers(others);
    }
    getOtherUsers();
  }, [allRooms, user]);

  function selectRoomHandler(room) {
    setSelectedRoom(room);
  }
  async function onSelectUser(person) {
    try {
      const res = await axiosInstance.post('/rooms/init', {
        otheruser: person._id,
      });

      const existed = res.data.alreadyExisted;
      const roomData = res.data.data;

      const otherUser =
        roomData.users?.find((u) => u._id !== user._id) || roomData.users?.[0];

      const selectedRoomData = {
        room: roomData._id,
        otherUser,
      };

      if (!existed) {
        setAllRooms((prev) => [...prev, roomData]);
        toast.success('Chatroom created successfully');
      } else {
        toast.success('Opening existing conversation');
      }

      setSelectedRoom(selectedRoomData);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);

      toast.error(err.response?.data?.message || 'Unable to initialize chat');
    }
  }

  // async function testFirebaseRead() {
  //   try {
  //     const roomId = allRooms[0]._id;

  //     const messagesRef = ref(database, `messages/${roomId}`);

  //     const snapshot = await get(messagesRef);

  //     console.log('Read permitted:', snapshot.exists());
  //     console.log('Messages:', snapshot.val());
  //   } catch (err) {
  //     console.error('Read test failed:', err.code, err.message);
  //   }
  // }
  // async function testFirebaseWrite() {
  //   try {
  //     const roomId = allRooms[0]._id;

  //     const messagesRef = ref(database, `messages/${roomId}`);
  //     const newMessageRef = push(messagesRef);

  //     await set(newMessageRef, {
  //       content: 'Security rules test',
  //       senderId: auth.currentUser.uid,
  //       timestamp: Date.now(),
  //     });

  //     console.log('Write permitted:', newMessageRef.key);
  //   } catch (err) {
  //     console.error('Write test failed:', err.code, err.message);
  //   }
  // }
  // async function testNonMemberAccess() {
  //   try {
  //     const messagesRef = ref(database, 'messages/6afad1bb726114b61278b75c');
  //     const snapshot = await get(messagesRef);

  //     console.log('Unexpectedly allowed:', snapshot.val());
  //   } catch (err) {
  //     console.log('Access denied:', err.code, err.message);
  //   }
  // }
  async function sendMessageHandler() {
    if (!messageInput.trim() || !selectedRoom?.room || isSending) return;

    setIsSending(true);

    try {
      const messagesRef = ref(database, `messages/${selectedRoom.room}`);
      const newMessageRef = push(messagesRef);

      await set(newMessageRef, {
        content: messageInput.trim(),
        senderId: auth.currentUser?.uid || user._id,
        timestamp: Date.now(),
      });

      setMessageInput('');
    } catch (err) {
      console.error('Message sending failed:', err);
    } finally {
      setIsSending(false);
    }
  }
  const handleKeyDown = async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      await sendMessageHandler();
    }
  };
  const isSearching =
    loading ||
    (searchInput.trim() !== debouncedSearchTerm &&
      searchInput.trim().length > 0);

  return (
    <>
      {/* <button onClick={testNonMemberAccess}>
        Test Firebase Non Member Access
      </button>
      <button onClick={testFirebaseWrite}>Test Firebase Write</button>
      <button onClick={testFirebaseRead}>Test Firebase Read</button> */}
      <SearchModal
        isModalOpen={isModalOpen}
        onClose={closeModalHandler}
        searchInput={searchInput}
        searchInputHandler={searchInputHandler}
        searchResults={searchResults}
        isLoading={isSearching}
        searchError={searchError}
        onSelectUser={onSelectUser}
      />

      <div
        id="chat-layout"
        className={`w-full h-screen overflow-hidden flex transition-all duration-200 ${
          isModalOpen ? 'blur-xs pointer-events-none select-none' : ''
        }`}
      >
        <Sidebar
          user={user}
          logoutHandler={logoutHandler}
          modalHandler={openModalHandler}
          otherUsers={otherUsers}
          selectRoomHandler={selectRoomHandler}
          userStatuses={userStatuses}
        />

        <main className="w-full h-screen min-h-0 flex flex-col flex-1 overflow-hidden bg-slate-300/30">
          {selectedRoom ? (
            // Room has been selected after a user was clicked
            <>
              {/* Top bar showing info about the second user */}
              <div className="w-full flex justify-between items-center gap-4 bg-white border border-black/10">
                <div
                  className="w-full flex justify-between items-center gap-4 p-3 rounded-sm transition-all duration-300
                "
                >
                  <div className="w-full flex justify-center items-center gap-1">
                    <div className="size-10 border rounded-full overflow-hidden shrink-0 border-white">
                      <img
                        className="object-cover"
                        src={selectedRoom.otherUser.avatar}
                      />
                    </div>
                    <div className="w-full flex flex-col">
                      <p className="text-black text-lg">
                        {selectedRoom.otherUser.fullName}
                      </p>
                      <p className="text-xs">
                        {isOtherUserTyping
                          ? 'Typing...'
                          : otherUserStatus?.online
                            ? 'Online'
                            : otherUserStatus?.lastSeen
                              ? `Last seen ${new Date(otherUserStatus.lastSeen).toLocaleString()}`
                              : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-4">
                  <button className="cursor-pointer text-2xl">⋮</button>
                </div>
              </div>
              {/* Chat area */}
              <div
                id="#chat-layout"
                className="w-full flex-1 min-h-0 flex flex-col bg-[url('/Soft-Ivory-Chat-Doodle-Wallpaper.png')] bg-no-repeat bg-cover relative"
              >
                <div
                  ref={messagesContainerRef}
                  className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 py-4"
                >
                  {messages.length === 0 ? (
                    // No messages yet , show this UI
                    <div className="w-fit bg-white/50 flex flex-col gap-4 m-auto p-4 border border-slate-400/50 rounded-2xl">
                      <div className="text-center">
                        <p className="text-6xl">🗪</p>
                        <p>No Messages Yet</p>
                        <p className="text-black/50">
                          Send a Message To Start a Conversation
                        </p>
                      </div>
                    </div>
                  ) : (
                    // If Chat messages present, show this UI
                    <>
                      {messages.map((m) => (
                        <div
                          key={m.id}
                          className={`w-full flex px-3 ${
                            m.senderId === user._id
                              ? 'justify-end'
                              : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[75%] break-words px-3 py-2 rounded-xl shadow-sm ${
                              m.senderId === user._id
                                ? 'bg-green-200 text-black rounded-br-none'
                                : 'bg-white text-black rounded-bl-none'
                            }`}
                          >
                            <p>{m.content}</p>
                            <p className="text-[10px] text-black/40 text-right mt-1">
                              {new Date(m.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef}></div>
                    </>
                  )}
                </div>

                {/* Input bar and send button */}
                <div className="w-full shrink-0 flex bg-white p-2 border border-black/10">
                  <button className="text-2xl px-3 border border-gray-200 rounded-l-sm hover:cursor-pointer  hover:bg-black/10 transition-all duration-300">
                    ☺︎
                  </button>
                  <input
                    id="message-input"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-200 focus:ring-0 focus:outline-0 px-2"
                  />
                  <button
                    id="send-button"
                    onClick={sendMessageHandler}
                    disabled={isSending || !messageInput.trim()}
                    className={`border border-gray-200 px-3 text-3xl hover:cursor-pointer hover:bg-black/10 transition-all duration-300 rounded-r-sm`}
                  >
                    ⌲
                  </button>
                </div>
              </div>
            </>
          ) : (
            // No User selected for conversation i.e, no room selected ,Show this UI

            <div className="w-full flex-1 flex flex-col items-center justify-center gap-6 px-6">
              {/* Decorative glow behind the icon */}
              <div className="relative">
                <div
                  className="absolute -inset-8 bg-green-400/15 rounded-full blur-2xl"
                  aria-hidden="true"
                />
                <div className="relative size-24 bg-white rounded-3xl border border-black/10 shadow-sm flex items-center justify-center">
                  <p className="text-5xl">🗪</p>
                </div>
              </div>

              <div className="text-center max-w-sm flex flex-col gap-2">
                <p className="text-2xl font-bold text-slate-800">
                  Your Messages
                </p>
                <p className="text-slate-500">
                  Select a conversation from the sidebar or start a new chat to
                  begin messaging.
                </p>
              </div>

              <button
                onClick={openModalHandler}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-3 rounded-full shadow-sm transition-all duration-300 hover:cursor-pointer hover:shadow-md active:scale-95"
              >
                <span className="text-xl leading-none">＋</span>
                Start new chat
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                Pick up where you left off
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default Home;
