import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        async function checkSession() {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

                const response = await fetch(`${baseUrl}/api/v1/user/me`, {
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();

                    // SMART UNWRAPPER: Find the user object no matter how the backend nested it.
                    let actualUser = data;
                    if (data.user) {
                        actualUser = data.user;
                    } else if (data.data?.user) {
                        actualUser = data.data.user;
                    } else if (data.data) {
                        actualUser = data.data;
                    }

                    setUser(actualUser);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Session check failed:", error);
                setUser(null);
            } finally {
                setIsAuthLoading(false);
            }
        }

        checkSession();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, isAuthLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}