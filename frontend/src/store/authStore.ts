import {create} from "zustand"
import {persist} from "zustand/middleware"
import type { UserProfile } from "../api/auth"

interface AuthState{
    user:         UserProfile | null
    accessToken:  string | null
    isLoggedIn:   boolean
    setAuth:      (token: string, refresh: string, user: UserProfile) => void
    setUser:      (user: UserProfile) => void
    logout:       () => void
}

export const useAuthStore =create<AuthState>()(
    persist(
        (set) => ({
            user:null,
            accessToken:null,
            isLoggedIn:false,


            setAuth:(token,refresh,user)=>{
                localStorage.setItem('access_token',token)
                localStorage.setItem('refresh_token',refresh)
                set({user,accessToken:token,isLoggedIn:true})

            },
            setUser:(user)=>{
                set({user})
            },
            logout:()=>{
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                set({user:null,accessToken:null,isLoggedIn:false})
            },
        }),
        {
            name: 'auth-storage',
            partialize: (s) => ({ user: s.user, isLoggedIn: s.isLoggedIn }),
        }
    )
)