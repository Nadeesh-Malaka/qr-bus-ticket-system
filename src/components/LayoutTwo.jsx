import React from 'react'
import NavbarTwo from './NavbarTwo'

export default function LayoutTwo({ children }) {
  return (
    <>
      <NavbarTwo />
      {children}
    </>
  )
}
