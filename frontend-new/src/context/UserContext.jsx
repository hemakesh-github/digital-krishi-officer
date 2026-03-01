import { createContext, useState, useEffect } from 'react'
import { getUser } from '../api_services/api_services'

export const UserContextData = createContext();

function UserContext({ children }) {
    const [mobileNo, setMobileNo] = useState(null);
    const [type, setType] = useState(null);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await getUser();

                if (response.success) {
                    console.log(response);
                    const user = response.user;
                    console.log(user)
                    setMobileNo(user.mobileNo);
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
    console.log(mobileNo, type, userId);
    return (
        <UserContextData.Provider value={{ mobileNo, setMobileNo, type, setType, userId, setUserId, loading }}>
            {children}
        </UserContextData.Provider>
    )
}

export default UserContext;
