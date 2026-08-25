import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

const AuthContext = createContext();

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        async function checkSession() {
            try {
                const response = await apiFetch('/api/v1/user/me');

                if (response.ok) {
                    const data = await response.json();

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

function useAuth() {
    return useContext(AuthContext);
}

export { AuthProvider, useAuth };
