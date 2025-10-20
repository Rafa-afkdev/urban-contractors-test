/* eslint-disable react-hooks/exhaustive-deps */
"use client";


import { auth, getDocument, setDocument } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { DocumentData } from "firebase/firestore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "../interfaces/user.interface";
import { setInLocalstorage } from "../actions/set-in-LocalStorage";
import { getFromLocalstorage } from "../actions/get-from-LocalStorage";

export const useUser = () => {
  const [user, setUser] = useState<User | undefined | DocumentData>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const pathName = usePathname();
  const route = useRouter();

  const protectedRoutes = "/dashboard/home";
  //   const isInprotectedRoute = protectedRoutes.includes(pathName);

  const getUserFromDB = async (uid: string) => {
    const path = `users/${uid}`;
    try {
      const res = await getDocument(path);
      if (res) {
        setUser(res);
        setInLocalstorage("user", res);
      } else {
        // Create a basic user document if it doesn't exist
        const authUser = auth.currentUser;
        if (authUser) {
          const newUserData = {
            uid: authUser.uid,
            email: authUser.email,
            name: authUser.displayName || authUser.email?.split('@')[0] || 'Usuario',
            image: null,
            createdAt: new Date().toISOString()
          };
          
          await setDocument(path, newUserData);
          setUser(newUserData);
          setInLocalstorage("user", newUserData);
          console.log('Created new user document:', newUserData);
        }
      }
    } catch (error) {
      console.error("Error fetching user from database:", error);
    }
  };

  useEffect(() => {
    // Check localStorage first for faster initial load
    const userInLocal = getFromLocalstorage("user");
    if (userInLocal) {
      setUser(userInLocal);
      setLoading(false);
    }

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      //? SI EL USUARIO ESTÁ AUTENTICADO
      if (authUser) {
        const userInLocal = getFromLocalstorage("user");
        if (userInLocal) {
          // Only update if different from current user
          if (!user || user.uid !== userInLocal.uid) {
            setUser(userInLocal);
          }
        } else {
          await getUserFromDB(authUser.uid);
        }
      }
      //? SI EL USUARIO NO ESTÁ AUTENTICADO
      else {
        setUser(undefined);
        // Clear localStorage when user is not authenticated
        localStorage.removeItem('user');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
};
    