import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useCartStore } from '@/entities/cart';

import { renderWithProviders } from '../../../../tests/render';
import { PromoForm } from './promo-form';

describe('<PromoForm />', () => {
  beforeEach(() => useCartStore.setState({ promo: null }));

  it('applies a valid code', async () => {
    await renderWithProviders(<PromoForm />);
    await userEvent.type(screen.getByLabelText('Промокод'), 'kobo10');
    await userEvent.click(screen.getByRole('button', { name: 'Применить' }));
    expect(await screen.findByText('Промокод применён')).toBeInTheDocument();
    expect(useCartStore.getState().promo).toBe('KOBO10');
  });

  it('explains why a code does not work', async () => {
    await renderWithProviders(<PromoForm />, { lang: 'en' });
    await userEvent.type(screen.getByLabelText('Promo code'), 'SUMMER24');
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('This promo code has expired');
    expect(useCartStore.getState().promo).toBeNull();
  });
});
