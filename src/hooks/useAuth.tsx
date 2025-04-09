import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Аутентификация күйінің түрі
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Аутентификация контексттің түрі
interface AuthContextType extends AuthState {
  login: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

// Аутентификация контексті
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider компоненті
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Инициализация кезінде сессияны тексеру
  useEffect(() => {
    const checkSession = async () => {
      // Таймаут қосу (CORS мәселелерін болдырмау үшін)
      setTimeout(async () => {
        try {
          console.log('Checking authentication session...');
          
          // API URL дұрыстау - даму ортасында да /api қосымша жолын пайдалану
          // Жергілікті сервер 3000 портында жұмыс істеуі мүмкін
          const apiUrl = '/api/check-session';
          
          // Сессияны тексеру үшін API-ге сұраныс жасау
          const response = await fetch(apiUrl, {
            method: 'GET',
            credentials: 'include', // Cookie-лерді қосу
            headers: {
              'Cache-Control': 'no-cache, no-store, max-age=0',
              'Pragma': 'no-cache',
            },
          });

          // Жауапты өңдеу
          try {
            const data = await response.json();
            console.log('Session check response:', response.status, data);
    
            if (response.ok && data.isAuthenticated) {
              console.log('User is authenticated');
              setState({
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
            } else {
              console.log('User is NOT authenticated');
              setState({
                isAuthenticated: false,
                isLoading: false,
                error: null,
              });
            }
          } catch (parseError) {
            console.error('Error parsing session response:', parseError);
            setState({
              isAuthenticated: false,
              isLoading: false,
              error: null, // Қатені көрсетпейміз, тек аутентификацияны жоқ деп белгілейміз
            });
          }
        } catch (error) {
          console.error('Session check error:', error);
          
          // API қолжетімсіз болса да, пайдаланушы негізгі сайтты қолдана алу керек
          setState({
            isAuthenticated: false,
            isLoading: false,
            error: null, // Қатені көрсетпейміз, тек аутентификацияны жоқ деп белгілейміз
          });
        }
      }, 500); // 500ms кідіру
    };

    checkSession();
  }, []);

  // Жүйеге кіру функциясы
  const login = async (password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
        credentials: 'include', // Cookie-лерді қосу
      });

      const data = await response.json();

      if (response.ok) {
        setState({
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        setState({
          isAuthenticated: false,
          isLoading: false,
          error: data.message || 'Жүйеге кіру кезінде қате шықты',
        });
        return false;
      }
    } catch (error) {
      setState({
        isAuthenticated: false,
        isLoading: false,
        error: 'Жүйеге кіру кезінде қате шықты',
      });
      return false;
    }
  };

  // Жүйеден шығу функциясы
  const logout = async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Сұранысты бірегей ID-мен жіберу 
      // (кэштеуді болдырмау үшін)
      const requestId = uuidv4();
      const response = await fetch(`/api/logout?_=${requestId}`, {
        method: 'POST',
        credentials: 'include', // Cookie-лерді қосу
        headers: {
          'Cache-Control': 'no-cache, no-store, max-age=0',
          'Pragma': 'no-cache',
        },
      });

      console.log('Logout response status:', response.status);
      
      // Әрдайым state-ті жаңарту, тіпті сервер қатесі болған жағдайда да
      setState({
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      
      // Жергілікті сақтаулы деректерді тазалау (егер бар болса)
      localStorage.removeItem('auth_session');
      sessionStorage.removeItem('auth_session');
      
      // Дереу басты бетке қайта бағыттау
      console.log('Redirecting to home page...');
      window.location.href = '/';
      
    } catch (error) {
      console.error('Logout error:', error);
      
      // Қате болса да, state-ті тазалап, қайта бағыттау
      setState({
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      
      // Басты бетке қайта бағыттау
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth hook-ты AuthProvider компоненті ішінде қолдану керек');
  }
  
  return context;
}; 