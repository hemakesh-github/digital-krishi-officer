import { createContext, useState, useEffect } from 'react'
import { getUser } from '../api_services/api_services'

export const UserContextData = createContext();

function UserContext({ children }) {
    const [mobileNo, setMobileNo] = useState(null);
    const [type, setType] = useState(null);
    const [userId, setUserId] = useState(null);

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
            }
        }
        fetchUser();
    }, [])
    console.log(mobileNo, type, userId);
    return (
        <UserContextData.Provider value={{ mobileNo, setMobileNo, type, setType, userId, setUserId }}>
            {children}
        </UserContextData.Provider>
    )
}

export default UserContext;
