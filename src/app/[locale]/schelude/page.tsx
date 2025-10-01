import type { Metadata } from 'next';
import React from 'react'
import Schelude from './components/schelude'
export const metadata: Metadata = {
    title: "Schelude",
    description: "Schelude",
};

export default function ScheludePage() {
  return (
    <div>
        <Schelude/>
    </div>
  )
}
