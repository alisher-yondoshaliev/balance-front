import { Outlet } from 'react-router-dom';

/**
 * Public Layout - used for landing page, login, register, etc.
 * No header/sidebar, just full-width outlet
 */
export default function PublicLayout() {
    return <Outlet />;
}
