import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TooltipContextual } from '@/components/ui/TooltipContextual';
import { GlobalProviders } from '@/components/GlobalProviders';

describe('TooltipContextual Component', () => {
  const mockContent = "Sugestão de Cenário: Mude para Inferior";
  const mockTriggerText = "Hover me";

  // Mock do Radix Portal e ResizeObserver para testes JSDOM
  beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  it('test_tooltip_renders_trigger_without_crashing', () => {
    // Arrange
    render(
      <GlobalProviders>
        <TooltipContextual content={mockContent}>
          <button>{mockTriggerText}</button>
        </TooltipContextual>
      </GlobalProviders>
    );

    // Assert
    expect(screen.getByText(mockTriggerText)).toBeInTheDocument();
    expect(screen.queryByText(mockContent)).not.toBeInTheDocument();
  });

  it('test_tooltip_shows_content_on_hover', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <GlobalProviders>
        <TooltipContextual content={mockContent}>
          <button>{mockTriggerText}</button>
        </TooltipContextual>
      </GlobalProviders>
    );

    // Act
    const trigger = screen.getByText(mockTriggerText);
    await user.hover(trigger);

    // Assert
    await waitFor(() => {
      expect(screen.getAllByText(mockContent).length).toBeGreaterThan(0);
    });
  });

  it('test_tooltip_shows_content_on_keyboard_focus', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <GlobalProviders>
        <TooltipContextual content={mockContent}>
          <button>{mockTriggerText}</button>
        </TooltipContextual>
      </GlobalProviders>
    );

    // Act
    await user.tab();

    // Assert
    expect(screen.getByText(mockTriggerText)).toHaveFocus();
    await waitFor(() => {
      expect(screen.getAllByText(mockContent).length).toBeGreaterThan(0);
    });
  });
});
