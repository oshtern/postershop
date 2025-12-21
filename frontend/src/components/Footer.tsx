import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link to="/">Home</Link>
        <Link to="/help">Help</Link>
        <Link to="/terms">Terms</Link>
      </div>
    </footer>
  );
}
