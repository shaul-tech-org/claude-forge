import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('renders claude-forge title', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    expect(screen.getByText('claude-forge')).toBeDefined();
  });

  it('renders 4 dashboard cards', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    expect(screen.getAllByText('New Harness').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Analyze Harness').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Pattern Library').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Learning Guide').length).toBeGreaterThanOrEqual(1);
  });

  it('renders canvas builder link', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    expect(screen.getAllByText(/Canvas Builder/).length).toBeGreaterThanOrEqual(1);
  });
});
