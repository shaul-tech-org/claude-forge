import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('renders claude-forge title', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    expect(screen.getByText('claude-forge')).toBeInTheDocument();
  });

  it('renders 4 dashboard cards', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    expect(screen.getByText('New Harness')).toBeInTheDocument();
    expect(screen.getByText('Analyze Harness')).toBeInTheDocument();
    expect(screen.getByText('Pattern Library')).toBeInTheDocument();
    expect(screen.getByText('Learning Guide')).toBeInTheDocument();
  });

  it('renders canvas builder link', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Canvas Builder/)).toBeInTheDocument();
  });
});
