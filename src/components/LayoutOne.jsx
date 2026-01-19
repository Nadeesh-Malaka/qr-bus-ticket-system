import react from 'react'
import NavbarOne from '../pages/NavbarOne'

export default function LayoutOne({ children }) {
  return (
    <>
      <NavbarOne />
      { children }
    </>
  );
}
