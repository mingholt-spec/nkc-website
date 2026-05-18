'use client';
import { createContext, useContext } from 'react';

export type Lang = 'sv' | 'en';
export const LanguageContext = createContext<Lang>('sv');
export function useLanguage(): Lang { return useContext(LanguageContext); }
