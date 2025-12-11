
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import {
  selectIsLoggedIn,
  setIsLoggedIn,
  setLogout,
  setToken,
} from "../store/reducers/auth-persist.reducer";
import AuthNavigation from "./Auth.Navigation";
import MainNavigation from "./Main.Navigation";
import { supabase } from "../utils/supabaseClient";
import type { Session } from "@supabase/supabase-js";

const BaseNavigation: React.FC = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const dispatch = useDispatch();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const initializeSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        dispatch(setLogout());
        setSession(null);
        return;
      }

      setSession(session);
      dispatch(setIsLoggedIn(true));
      dispatch(setToken(session.access_token));
    };

    initializeSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        dispatch(setLogout());
      } else {
        dispatch(setIsLoggedIn(true));
        dispatch(setToken(session.access_token));
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  useEffect(() => {
    const refreshSession = async () => {
      const { data } = await supabase.auth.refreshSession();

      if (!data?.session) {
        dispatch(setLogout());
        return;
      }

      dispatch(setToken(data.session.access_token));
      dispatch(setIsLoggedIn(true));
    };

    const interval = setInterval(refreshSession, 1000 * 60 * 50);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <NavigationContainer>
      {isLoggedIn ? <MainNavigation /> : <AuthNavigation />}
    </NavigationContainer>
  );
};

export default BaseNavigation;
