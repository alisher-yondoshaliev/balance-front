import type { ReactNode } from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
    eyebrow?: string;
}

export default function PageHeader({
    title,
    subtitle,
    action,
    eyebrow = 'Dashboard',
}: PageHeaderProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                gap: 2,
                mb: 3,
            }}
        >
            <Stack spacing={1} sx={{ minWidth: 0 }}>
                <Chip
                    label={eyebrow}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
                />
                <Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 800,
                            color: 'text.primary',
                            letterSpacing: '-0.03em',
                        }}
                    >
                        {title}
                    </Typography>
                    {subtitle ? (
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>
                            {subtitle}
                        </Typography>
                    ) : null}
                </Box>
            </Stack>

            {action ? <Box sx={{ width: { xs: '100%', md: 'auto' } }}>{action}</Box> : null}
        </Box>
    );
}
