import { useState, useEffect } from 'react'
import type { NextPage } from 'next'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useRouter } from 'next/router'

interface User {
  id: number;
  username: string;
  admin: boolean;
}

const AdminPage: NextPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loggedInUser, setLoggedInUser] = useState('');
  const router = useRouter();

  useEffect(() => {
    const { username } = router.query;
    if (username) {
      setLoggedInUser(username as string);
    }
    fetchUsers();
  }, [router.query]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const deleteUser = async (id: number) => {
    try {
      await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black py-6 flex flex-col justify-center sm:py-12 relative dark:text-green-500 dark:font-mono">
      <ThemeToggle />
      <div className="relative py-3 sm:max-w-2xl sm:mx-auto w-full px-4 sm:px-0">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-green-500 dark:to-green-700 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative bg-white dark:bg-black shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-3xl font-bold mb-6 text-center dark:text-green-500">Admin Panel</h1>
          <p className="text-center mb-4 dark:text-green-500">Logged in as: {loggedInUser}</p>
          <Card className="mb-6 dark:bg-black dark:border-green-500">
            <CardHeader>
              <CardTitle className="dark:text-green-500">User List</CardTitle>
            </CardHeader>
            <CardContent>
              {users.length > 0 ? (
                users.map((user) => (
                  <div key={user.id} className="flex justify-between items-center mb-2">
                    <span>{user.username} {user.admin ? '(Admin)' : ''}</span>
                    <Button 
                      onClick={() => deleteUser(user.id)}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Delete
                    </Button>
                  </div>
                ))
              ) : (
                <p>No users found.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AdminPage