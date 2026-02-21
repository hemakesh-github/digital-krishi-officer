export const setToken = async (token) => {
    localStorage.setItem('token', token);
}

export const getToken = async () => {
    return localStorage.getItem('token');
}

export const removeToken = async () => {
    localStorage.removeItem('token');
}

export const checkAuth = async () => {
    return localStorage.getItem('token') !== null;
}

export const logout = async () => {
    localStorage.removeItem('token');
}