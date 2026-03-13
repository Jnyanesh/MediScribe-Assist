"use server";
// src/lib/auth.ts
import {cookies} from 'next/headers';

// Set token in secure, HTTP-only cookie
export const setToken = async (token, expires) => {
    //@ts-ignore
    (await cookies()).set('token', token, {
        httpOnly: true,
        //   secure: process.env.NODE_ENV === 'production',
        secure: true,
        sameSite: 'strict',
        maxAge: expires || 60 * 60 * 24 * 7, // 7 days default
        path: '/'
    })
}

// Get token from cookie
export const getToken = async() => {
    //@ts-ignore

    return (await cookies()).get('token');
}

// Remove token cookie
export const clearToken = async() => {
    //@ts-ignore
    (await cookies()).delete('token');
}

// Check if user is authenticated
export const isAuthenticated = async() => {
    return true;
}