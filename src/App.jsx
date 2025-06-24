import { useEffect, useState } from "react";
import { supabase } from "./utils/supabase";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Home from "./pages/Home";
import AddMember from "./pages/AddMember";
import MemberDetails from "./pages/MemberDetails";
import EditMember from "./pages/EditMember";
import "./index.css"


function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentSession = supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <BrowserRouter>
      <Routes>
        {!session ? (
          <Route path="*" element={<Login />} />
        ) : (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/add" element={<AddMember />} />
            <Route path="/member/:id" element={<MemberDetails />} />
            <Route path="/edit/:id" element={<EditMember />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;

