import { useEffect } from 'react';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export function useOnlinePresence() {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);

    // Funzione per aggiornare lo stato online
    const updateOnlineStatus = async (status: 'online' | 'offline') => {
      try {
        await updateDoc(userDocRef, {
          status,
          lastSeen: serverTimestamp()
        });
      } catch (error) {
        console.error('Error updating online status:', error);
      }
    };

    // Gestisci gli eventi di visibilità della pagina
    const handleVisibilityChange = () => {
      const status = document.visibilityState === 'visible' ? 'online' : 'offline';
      updateOnlineStatus(status);
    };

    // Gestisci gli eventi di connessione
    const handleOnline = () => updateOnlineStatus('online');
    const handleOffline = () => updateOnlineStatus('offline');

    // Imposta i listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Imposta lo stato iniziale come online
    updateOnlineStatus('online');

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      updateOnlineStatus('offline');
    };
  }, [currentUser]);
} 