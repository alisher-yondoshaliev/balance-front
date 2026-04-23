import React from 'react';
import {
    Box,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Stack,
    Collapse,
    IconButton,
    InputAdornment,
} from '@mui/material';
import {
    Search as SearchIcon,
    Clear as ClearIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';

export interface FilterConfig {
    key: string;
    label: string;
    type: 'text' | 'select' | 'date' | 'daterange';
    options?: Array<{ value: string; label: string }>;
    placeholder?: string;
}

interface AdvancedFilterProps {
    filters: FilterConfig[];
    values: Record<string, any>;
    onFilterChange: (key: string, value: any) => void;
    onReset: () => void;
    onApply?: () => void;
    loading?: boolean;
}

/**
 * AdvancedFilter Component
 * Reusable filtering interface for admin pages
 */
export const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
    filters,
    values,
    onFilterChange,
    onReset,
    onApply,
    loading = false,
}) => {
    const [expanded, setExpanded] = React.useState(false);

    const activeFilters = Object.entries(values).filter(([, value]) => value !== '' && value !== null);

    return (
        <Box sx={{ mb: 3 }}>
            {/* Filter Summary */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    backgroundColor: 'background.paper',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                    <SearchIcon />
                    <TextField
                        placeholder="Qidirish..."
                        size="small"
                        variant="standard"
                        value={values.search || ''}
                        onChange={(e) => onFilterChange('search', e.target.value)}
                        disabled={loading}
                        InputProps={{
                            endAdornment: values.search && (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={() => onFilterChange('search', '')}
                                    >
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{ flex: 1 }}
                    />
                </Box>

                <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
                    {activeFilters.length > 0 && (
                        <Button
                            size="small"
                            onClick={onReset}
                            disabled={loading}
                        >
                            Tozalash ({activeFilters.length})
                        </Button>
                    )}
                    <IconButton
                        size="small"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Stack>
            </Box>

            {/* Active Filter Chips */}
            {activeFilters.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                    {activeFilters.map(([key, value]) => {
                        const filter = filters.find((f) => f.key === key);
                        const label = filter?.label || key;
                        const displayValue = filter?.type === 'select'
                            ? filter.options?.find((o) => o.value === value)?.label || value
                            : value;

                        return (
                            <Chip
                                key={key}
                                label={`${label}: ${displayValue}`}
                                onDelete={() => onFilterChange(key, '')}
                                size="small"
                            />
                        );
                    })}
                </Box>
            )}

            {/* Expanded Filters */}
            <Collapse in={expanded} sx={{ mt: 2 }}>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                        gap: 2,
                        p: 2,
                        backgroundColor: 'background.paper',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    {filters
                        .filter((f) => f.key !== 'search')
                        .map((filter) => (
                            <FormControl key={filter.key} fullWidth size="small" disabled={loading}>
                                {filter.type === 'select' ? (
                                    <>
                                        <InputLabel>{filter.label}</InputLabel>
                                        <Select
                                            label={filter.label}
                                            value={values[filter.key] || ''}
                                            onChange={(e) => onFilterChange(filter.key, e.target.value)}
                                        >
                                            <MenuItem value="">
                                                <em>Barchasi</em>
                                            </MenuItem>
                                            {filter.options?.map((opt) => (
                                                <MenuItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </>
                                ) : (
                                    <TextField
                                        label={filter.label}
                                        type={filter.type}
                                        placeholder={filter.placeholder}
                                        value={values[filter.key] || ''}
                                        onChange={(e) => onFilterChange(filter.key, e.target.value)}
                                    />
                                )}
                            </FormControl>
                        ))}
                </Box>

                {onApply && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                        <Button variant="outlined" onClick={() => setExpanded(false)} disabled={loading}>
                            Yopish
                        </Button>
                        <Button variant="contained" onClick={onApply} disabled={loading}>
                            Qo'llash
                        </Button>
                    </Box>
                )}
            </Collapse>
        </Box>
    );
};
