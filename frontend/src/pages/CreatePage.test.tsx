import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CreatePage } from './CreatePage';

describe('CreatePage (HarnessWizard)', () => {
  it('renders step 1 project profile', () => {
    render(
      <MemoryRouter>
        <CreatePage />
      </MemoryRouter>
    );
    expect(screen.getByText('Project Profile')).toBeDefined();
    expect(screen.getByPlaceholderText('my-awesome-project')).toBeDefined();
  });

  it('shows step indicator', () => {
    render(
      <MemoryRouter>
        <CreatePage />
      </MemoryRouter>
    );
    expect(screen.getAllByText(/Step 1/).length).toBeGreaterThanOrEqual(1);
  });

  it('shows language options', () => {
    render(
      <MemoryRouter>
        <CreatePage />
      </MemoryRouter>
    );
    expect(screen.getAllByText('TypeScript').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Python').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('PHP').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Go').length).toBeGreaterThanOrEqual(1);
  });

  it('shows framework options', () => {
    render(
      <MemoryRouter>
        <CreatePage />
      </MemoryRouter>
    );
    expect(screen.getAllByText('React').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Laravel').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Next.js').length).toBeGreaterThanOrEqual(1);
  });

  it('has back and next buttons', () => {
    render(
      <MemoryRouter>
        <CreatePage />
      </MemoryRouter>
    );
    expect(screen.getAllByText('Back').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Next').length).toBeGreaterThanOrEqual(1);
  });
});
