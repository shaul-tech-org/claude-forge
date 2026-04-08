import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LearnPage } from './LearnPage';

describe('LearnPage', () => {
  it('renders learning guide title', () => {
    render(
      <MemoryRouter>
        <LearnPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Learning Guide')).toBeDefined();
  });

  it('renders 4 navigation sections', () => {
    render(
      <MemoryRouter>
        <LearnPage />
      </MemoryRouter>
    );
    // These texts appear in both sidebar nav and content area
    expect(screen.getAllByText('Harness Engineering이란?').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('6축 프레임워크').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('시작하기 튜토리얼').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('FAQ').length).toBeGreaterThanOrEqual(1);
  });

  it('switches section content when clicked', () => {
    render(
      <MemoryRouter>
        <LearnPage />
      </MemoryRouter>
    );
    const faqButtons = screen.getAllByText('FAQ');
    // Click the sidebar nav button (first one)
    fireEvent.click(faqButtons[0]);
    // FAQ heading should appear as main content title
    expect(screen.getAllByText('FAQ').length).toBeGreaterThanOrEqual(2);
  });
});
