import { createContext, useState, useEffect } from 'react'
import { getUser } from '../api_services/api_services'

export const UserContextData = createContext();

function UserContext({ children }) {
    const [email, setEmail] = useState(null);
    const [type, setType] = useState(null);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await getUser();

                if (response.success) {
                    const user = response.user;
                    setEmail(user.email);
                    setType(user.role);
                    setUserId(user.id);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, [])
    return (
        <UserContextData.Provider value={{ email, setEmail, type, setType, userId, setUserId, loading }}>
            {children}
        </UserContextData.Provider>
    )
}

export default UserContext;
