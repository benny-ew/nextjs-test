import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateTaskPage from '@/app/tasks/create/page';

// Simple debug test to check validation
describe('Debug Validation', () => {
  it('should show validation messages on blur', async () => {
    const user = userEvent.setup();
    render(<CreateTaskPage />);

    const titleInput = screen.getByPlaceholderText('Enter a descriptive task title');
    
    // Focus and then blur the title field
    await user.click(titleInput);
    await user.tab(); // This should trigger blur

    // Wait and check what's in the DOM
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('DOM after blur:');
    console.log(document.body.innerHTML);
    
    // Try to find error messages
    const errorMessages = screen.queryAllByText(/required/i);
    console.log('Found error messages:', errorMessages.map(el => el.textContent));
    
    // Check if the field has error styling
    console.log('Title input classes:', titleInput.className);
    
    // Check for validation icons
    const alertIcon = screen.queryByTestId('alert-circle-icon');
    console.log('Alert icon found:', !!alertIcon);
  });
});
