import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function usePendingAppointments() {
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Create query for pending appointments
      const appointmentsRef = collection(db, 'citas_agendadas');
      const q = query(appointmentsRef, where('status', '==', 'PENDIENTE'));

      // Listen to real-time updates
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          setPendingCount(snapshot.size);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Error fetching pending appointments:', err);
          setError('Error loading appointments');
          setLoading(false);
        }
      );

      // Cleanup subscription
      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up appointments listener:', err);
      setError('Error setting up listener');
      setLoading(false);
    }
  }, []);

  return { pendingCount, loading, error };
}
