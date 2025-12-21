import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Banner from '@/components/Banner';

/** App shell with header/footer, global banner, and routed content */
export default function App() {
  return (
    <div>
      <Header />
      <Banner />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
