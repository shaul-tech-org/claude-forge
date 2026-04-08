import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CreatePage } from './CreatePage';

describe('CreatePage', () => {
  it('renders step 1 project profile', () => {
    render(
      <MemoryRouter>
        <CreatePage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Project Profile')).toBeInTheDocument();
    expect(screen.getByText('Project Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('my-awesome-project')).toBeInTheDocument();
  });

  it('shows step indicator with 5 steps', () => {
    render(
      <MemoryRouter>
        <CreatePage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Step 1 / 5')).toBeInTheDocument();
  });

  it('next button is disabled when project name is empty', () => {
    render(
      <MemoryRouter>
        <CreatePage />
      </MemoryRouter>,
    );
    const nextButton = screen.getByRole('button', { name: 'Next' });
    expect(nextButton).toBeDisabled();
  });
});
