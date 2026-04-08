import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LearnPage } from './LearnPage';

describe('LearnPage', () => {
  it('renders learning guide title', () => {
    render(
      <MemoryRouter>
        <LearnPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Learning Guide')).toBeInTheDocument();
  });

  it('renders 4 navigation sections', () => {
    render(
      <MemoryRouter>
        <LearnPage />
      </MemoryRouter>,
    );
    // The first section text appears both in sidebar and as heading
    expect(screen.getAllByText('Harness Engineering이란?').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('6축 프레임워크')).toBeInTheDocument();
    expect(screen.getByText('시작하기 튜토리얼')).toBeInTheDocument();
    expect(screen.getByText('FAQ')).toBeInTheDocument();
  });

  it('displays section content when clicked', () => {
    render(
      <MemoryRouter>
        <LearnPage />
      </MemoryRouter>,
    );
    // First section is active by default
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Harness Engineering이란?');

    // Click on FAQ section
    fireEvent.click(screen.getByRole('button', { name: 'FAQ' }));

    // FAQ heading should now be the main content h1
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('FAQ');
  });
});
