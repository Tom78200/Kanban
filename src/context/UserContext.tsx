import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

export type UserType = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
};

interface UserContextType {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  updateUser: (fields: Partial<UserType>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'taskmaster_user';

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const [user, setUser] = useState<UserType | null>(null);
  const isManuallyUpdated = useRef(false);

  // Initialiser le context avec le localStorage si la session n'a pas changé
  useEffect(() => {
    if (!session?.user) return;
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as UserType;
      if (parsed.id === session.user.id) {
        setUser(parsed);
        return;
      }
    }
    // Sinon, initialiser avec la session
    setUser({
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      avatar: session.user.avatar,
      role: session.user.role,
    });
  }, [session]);

  // Synchronise le context avec la session NextAuth, sauf si updateUser vient d'être appelé
  useEffect(() => {
    if (session?.user && !isManuallyUpdated.current) {
      const newUser = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        avatar: session.user.avatar,
        role: session.user.role,
      };
      
      // Vérifier si les données ont vraiment changé
      setUser(prevUser => {
        if (!prevUser || 
            prevUser.name !== newUser.name || 
            prevUser.avatar !== newUser.avatar ||
            prevUser.email !== newUser.email) {
          console.log('UserContext: Mise à jour depuis la session', newUser);
          return newUser;
        }
        return prevUser;
      });
    }
  }, [session]);

  // Persister dans le localStorage à chaque changement de user
  useEffect(() => {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
    }
  }, [user]);

  // Permet de mettre à jour partiellement l'utilisateur (ex: avatar)
  const updateUser = (fields: Partial<UserType>) => {
    setUser((prev) => {
      const updated = prev ? { ...prev, ...fields } : prev;
      if (updated) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
    isManuallyUpdated.current = true;
    // Après 2 secondes, on autorise à nouveau la resynchro avec la session
    setTimeout(() => {
      isManuallyUpdated.current = false;
    }, 2000);
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
};



