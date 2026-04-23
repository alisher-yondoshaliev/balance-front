import type { ReactNode } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';

interface DataTableProps {
    title?: string;
    subtitle?: string;
    toolbar?: ReactNode;
    footer?: ReactNode;
    children: ReactNode;
}

export default function DataTable({
    title,
    subtitle,
    toolbar,
    footer,
    children,
}: DataTableProps) {
    return (
        <Paper
            sx={{
                overflow: 'hidden',
                borderRadius: 2,
            }}
        >
            {(title || subtitle || toolbar) ? (
                <Box
                    sx={{
                        px: { xs: 2, md: 3 },
                        py: { xs: 2, md: 2.5 },
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        background: 'linear-gradient(180deg, rgba(248,250,252,0.92) 0%, rgba(255,255,255,0.96) 100%)',
                    }}
                >
                    <Stack spacing={2}>
                        {(title || subtitle) ? (
                            <Box>
                                {title ? (
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                        {title}
                                    </Typography>
                                ) : null}
                                {subtitle ? (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        {subtitle}
                                    </Typography>
                                ) : null}
                            </Box>
                        ) : null}

                        {toolbar}
                    </Stack>
                </Box>
            ) : null}

            <Box sx={{ overflowX: 'auto' }}>{children}</Box>

            {footer ? (
                <Box
                    sx={{
                        px: { xs: 2, md: 3 },
                        py: 2,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: 'rgba(248,250,252,0.65)',
                    }}
                >
                    {footer}
                </Box>
            ) : null}
        </Paper>
    );
}
