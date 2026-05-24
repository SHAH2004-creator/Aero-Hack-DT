import React from "react";
import { Radio, LogIn, LogOut, Loader2, Database } from "lucide-react";
import { isFirebaseActive, auth } from "../firebase";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";

interface HeaderProps {
  systemIntegrity: "STABLE" | "DEGRADED" | "CRITICAL";
  user: any;
  setUser: (user: any) => void;
  loadingAuth: boolean;
  isConnected?: boolean;
}

export default function Header({ systemIntegrity, user, setUser, loadingAuth, isConnected = true }: HeaderProps) {
  
  const handleLogin = async () => {
    if (isFirebaseActive && auth) {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        setUser(result.user);
      } catch (err) {
        console.error("Firebase Auth Error: ", err);
        setUser({
          displayName: "Quality Inspector (Simulation Mode)",
          email: "as695853@gmail.com",
          photoURL: ""
        });
      }
    } else {
      setUser({
        displayName: "Quality Inspector (Simulation Mode)",
        email: "as695853@gmail.com",
        photoURL: ""
      });
    }
  };

  const handleLogout = async () => {
    if (isFirebaseActive && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Signout Error: ", err);
      }
    }
    setUser(null);
  };

  // State calculations for dynamic banner
  const isCritical = systemIntegrity === "CRITICAL";
  const isDegraded = systemIntegrity === "DEGRADED";

  return (
    <header className="border-b border-slate-800 bg-[#0F172A] sticky top-0 z-50 px-4 md:px-6 py-3.5 shadow-md" id="app_header">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between max-w-7xl mx-auto">
        
        {/* Title, Geometric Shield Logo & Subtitle */}
        <div className="flex items-center gap-4.5">
          {/* Beautiful Geometric Shield Logo */}
          <div className="flex-shrink-0">
            <svg className="w-10 h-10 text-slate-100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Outer Aerodynamic Shield */}
              <path d="M50 10 L82 18 C82 45, 75 75, 50 90 C25 75, 18 45, 18 18 L50 10 Z" stroke="currentColor" strokeWidth="5" fill="currentColor" fillOpacity="0.1" strokeLinejoin="miter"/>
              {/* Stylized Twin Aircraft Fuselage node network vector */}
              <path d="M50 25 L50 78" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
              <path d="M32 46 L50 34 L68 46" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M36 63 L50 56 L64 63" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="50" cy="34" r="5" fill="#EF4444" />
              <circle cx="32" cy="46" r="4" fill="currentColor" />
              <circle cx="68" cy="46" r="4" fill="currentColor" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-sans uppercase">
                AeroShield DT
              </h1>
              <span className="text-xs bg-slate-900 text-slate-300 font-mono px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold border border-slate-700">
                PRO-MRO v5.4
              </span>
            </div>
            <p className="text-xs text-slate-200 font-medium tracking-wide font-sans mt-0.5">
              MRO Predictive Maintenance & Quality Assurance Terminal
            </p>
          </div>
        </div>

        {/* Global Dynamic Status Banner & Workspace Indicators */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Dynamic alarm state logic */}
          {isCritical ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-650 bg-red-600 text-white text-xs font-mono font-bold uppercase rounded border border-red-500 animate-pulse shadow-md">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
              CRITICAL ALERT: DEGRADED FLIGHT MODE DETECTION
            </div>
          ) : (
            <div className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold uppercase rounded border transition-colors ${
              isDegraded 
                ? "bg-amber-600/30 text-amber-300 border-amber-500" 
                : "bg-emerald-950/80 text-emerald-400 border-emerald-600"
            }`}>
              <span className={`w-2 h-2 rounded-full ${isDegraded ? "bg-amber-500" : "bg-emerald-500"}`}></span>
              SYSTEM INTEGRITY: {systemIntegrity} | ACTIVE UAV FLEET: 12 | STATION: FLIGHT-LINE OPR
            </div>
          )}

          {/* Database Sync Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-[11px] font-mono text-slate-300">
            <DatabaseIcon className={`w-3.5 h-3.5 ${isFirebaseActive ? "text-emerald-500" : "text-amber-500"}`} />
            {isFirebaseActive ? (
              <span className="text-emerald-400 font-semibold text-[10px] tracking-wider">FIRESTORE ACTIVE</span>
            ) : (
              <span className="text-amber-400 font-semibold text-[10px] tracking-wider">SIMULATION DRIVER</span>
            )}
          </div>

          {/* Dynamic Link Status Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-[11px] font-mono text-slate-300">
            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`}></span>
            LINK: {isConnected ? (
              <span className="text-emerald-400 font-semibold text-[10px] tracking-wider">ONLINE</span>
            ) : (
              <span className="text-amber-400 font-semibold text-[10px] tracking-wider animate-pulse">SANDBOX DRIFT</span>
            )}
          </div>

          {/* Authorization credentials and profile */}
          <div className="flex items-center gap-2">
            {loadingAuth ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-slate-300">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                Validating SSO...
              </div>
            ) : user ? (
              <div className="flex items-center gap-3 px-3 py-1 bg-slate-900 border border-slate-700 rounded">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-medium text-white">{user.displayName || "Inspector"}</div>
                  <div className="text-[10px] font-mono text-slate-300">{user.email}</div>
                </div>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-6 h-6 rounded-full border border-slate-600" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-750 text-slate-200 flex items-center justify-center text-[10px] font-bold font-mono">
                    {user.email ? user.email.slice(0, 2).toUpperCase() : "QA"}
                  </div>
                )}
                <button 
                  onClick={handleLogout}
                  title="Disconnect Session"
                  className="p-1 px-2 text-slate-400 hover:text-red-400 transition"
                  id="auth_signout_btn"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-mono transition duration-150 border border-blue-500 font-bold"
                id="auth_signin_btn"
              >
                Authorization SSO
              </button>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}

function DatabaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"/>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>
    </svg>
  );
}
