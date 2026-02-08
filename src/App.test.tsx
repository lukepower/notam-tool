import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders NOTAM Tool header', () => {
  render(<App />);
  const heading = screen.getByText(/NOTAM Tool/i);
  expect(heading).toBeInTheDocument();
});
