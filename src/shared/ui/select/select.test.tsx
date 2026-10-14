import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Select } from './select';

const OPTIONS = [
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
  { value: 'pl', label: 'Polski' },
] as const;

const Demo = ({ onChange }: { onChange?: (value: string) => void }) => {
  const [value, setValue] = useState<'ru' | 'en' | 'pl'>('ru');
  return (
    <Select
      label="Язык"
      value={value}
      options={OPTIONS}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
};

describe('<Select />', () => {
  it('opens with the mouse and picks an option', async () => {
    const user = userEvent.setup();
    render(<Demo />);
    const combobox = screen.getByRole('combobox', { name: 'Язык' });
    expect(combobox).toHaveTextContent('Русский');
    expect(combobox).toHaveAttribute('aria-expanded', 'false');

    await user.click(combobox);
    expect(combobox).toHaveAttribute('aria-expanded', 'true');
    await user.click(screen.getByRole('option', { name: 'Polski' }));

    expect(combobox).toHaveTextContent('Polski');
    expect(combobox).toHaveAttribute('aria-expanded', 'false');
    expect(combobox).toHaveFocus();
  });

  it('is fully usable from the keyboard (APG select-only combobox)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Demo onChange={onChange} />);
    const combobox = screen.getByRole('combobox', { name: 'Язык' });

    await user.tab();
    expect(combobox).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(combobox).toHaveAttribute('aria-expanded', 'true');
    // The highlighted option starts at the current value and is announced via aria-activedescendant
    expect(combobox.getAttribute('aria-activedescendant')).toBe(
      screen.getByRole('option', { name: 'Русский' }).id,
    );
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('en');

    await user.keyboard('{ArrowDown}{End}{Escape}');
    expect(combobox).toHaveAttribute('aria-expanded', 'false');
    expect(onChange).toHaveBeenCalledTimes(1);

    // Type-ahead jumps to the matching option
    await user.keyboard('p{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('pl');
  });
});
