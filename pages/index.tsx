import { useState, useEffect } from 'react'
import type { NextPage } from 'next'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/ThemeToggle"
import { ExitIcon, GearIcon, ReloadIcon } from '@radix-ui/react-icons'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface Entry {
  id: number;
  name: string;
  message: string;
}

const Home: NextPage = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sessionId, setSessionId] = useState('');

  const router = useRouter();

  useEffect(() => {
    const { sessionId, username, isAdmin } = router.query;
    if (sessionId && username) {
      setIsAuthenticated(true);
      setSessionId(sessionId as string);
      setLoggedInUser(username as string);
      setIsAdmin(isAdmin === 'true');
      fetchEntries();
    }
  }, [router.query]);

  const fetchEntries = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/getEntries');
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching entries:', error);
      setEntries([]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const addEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/addEntry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId, username: loggedInUser }),
      });
      fetchEntries();
      setMessage('');
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addEntry(e);
    }
  };

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(data.redirectUrl);
      } else {
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setLoggedInUser('');
    setIsAdmin(false);
    setSessionId('');
    router.push('/');
  };

  const resetMessages = async () => {
    try {
      const response = await fetch('/api/resetMessages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        console.log('Messages reset successfully');
        fetchEntries(); // Refresh the entries after reset
      } else {
        console.error('Failed to reset messages');
      }
    } catch (error) {
      console.error('Error resetting messages:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black py-6 flex flex-col justify-center sm:py-12 relative dark:text-green-500 dark:font-mono">
      <ThemeToggle />
      <div className="relative py-3 sm:max-w-2xl sm:mx-auto w-full px-4 sm:px-0">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-green-500 dark:to-green-700 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative bg-white dark:bg-black shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-3xl font-bold mb-6 text-center dark:text-green-500">Guestbook</h1>
          {!isAuthenticated ? (
            <Card className="mb-6 dark:bg-black dark:border-green-500">
              <CardHeader>
                <CardTitle className="dark:text-green-500">Login</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={login} className="space-y-4">
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                    className="rounded-full dark:bg-black dark:text-green-500 dark:border-green-500"
                  />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="rounded-full dark:bg-black dark:text-green-500 dark:border-green-500"
                  />
                  <Button 
                    type="submit" 
                    className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-2 px-4 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 dark:from-green-500 dark:to-green-700 dark:hover:from-green-600 dark:hover:to-green-800"
                  >
                    Login
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="mb-6 dark:bg-black dark:border-green-500">
                <CardHeader>
                  <CardTitle className="dark:text-green-500">Add New Entry</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <span className="text-lg font-bold dark:text-green-500">Logged in as: {loggedInUser}</span>
                  </div>
                  <form onSubmit={addEntry} className="space-y-4">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Message"
                      required
                      className="rounded-xl dark:bg-black dark:text-green-500 dark:border-green-500"
                      onKeyPress={handleKeyPress}
                    />
                    <Button 
                      type="submit" 
                      className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-2 px-4 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 dark:from-green-500 dark:to-green-700 dark:hover:from-green-600 dark:hover:to-green-800"
                    >
                      Add Entry
                    </Button>
                  </form>
                  {isAdmin && (
                    <Button 
                      onClick={resetMessages} 
                      className="w-full mt-4 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
                    >
                      Reset Messages
                    </Button>
                  )}
                  <div className="flex justify-between mt-4">
                    <Button 
                      onClick={logout} 
                      className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
                      variant="outline"
                      size="icon"
                    >
                      <ExitIcon className="h-[1.2rem] w-[1.2rem]" />
                      <span className="sr-only">Logout</span>
                    </Button>
                    <Link href={`/admin?sessionId=${sessionId}`}>
                      <Button 
                        className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                        variant="outline"
                        size="icon"
                      >
                        <GearIcon className="h-[1.2rem] w-[1.2rem]" />
                        <span className="sr-only">Admin</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold dark:text-green-500">Entries</h2>
                  <Button
                    onClick={fetchEntries}
                    disabled={isRefreshing}
                    className="rounded-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
                  >
                    {isRefreshing ? (
                      <ReloadIcon className="h-4 w-4 animate-spin" />
                    ) : (
                      <ReloadIcon className="h-4 w-4" />
                    )}
                    <span className="ml-2">Refresh</span>
                  </Button>
                </div>
                {Array.isArray(entries) && entries.map((entry: Entry) => (
                  <Card key={entry.id} className="rounded-xl dark:bg-black dark:border-green-500">
                    <CardHeader>
                      <CardTitle className="dark:text-green-500">{entry.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="dark:text-green-500" dangerouslySetInnerHTML={{ __html: entry.message }}></p> {/* Vulnerable to XSS */}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home