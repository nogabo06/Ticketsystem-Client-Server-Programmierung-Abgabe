import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// Renders a component inside a router so hooks like useNavigate/useParams work.
export function renderWithRouter(ui, { route = '/' } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}
