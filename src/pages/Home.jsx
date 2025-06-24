import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isActive, isExpired } from "../utils/dateUtils";
import { supabase } from "../utils/supabase";
import BottomNavigation from "@/components/BottomNavigation";



export default function Home() {

  return (
    <div className="max-w-xl mx-auto p-4">
      
      <BottomNavigation />
    </div>
  );
}