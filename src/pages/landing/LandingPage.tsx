import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Button,
    Typography,
    Card,
    CardContent,
    Stack,
    useTheme,
    useMediaQuery,
    AppBar,
    Toolbar,
} from '@mui/material';
import {
    Store as StoreIcon,
    People as PeopleIcon,
    Person as PersonIcon,
    Tag as TagIcon,
    ShoppingBag as ShoppingBagIcon,
    Description as DescriptionIcon,
    Dashboard as DashboardIcon,
    ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

interface FeatureItemProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
    return (
        <Card
            elevation={0}
            sx={{
                height: '100%',
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
                    transform: 'translateY(-4px)',
                },
            }}
        >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 2,
                        color: '#2c3e50',
                        fontSize: '3rem',
                    }}
                >
                    {icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    {description}
                </Typography>
            </CardContent>
        </Card>
    );
}

export default function LandingPage() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#fafafa' }}>
            {/* Header */}
            <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
                <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            fontSize: isMobile ? '1.2rem' : '1.5rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                            letterSpacing: '-0.5px',
                        }}
                    >
                        Balance
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            color="primary"
                            sx={{
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: isMobile ? '0.85rem' : '1rem',
                                borderRadius: 1,
                            }}
                            onClick={() => navigate('/login')}
                        >
                            Kirish
                        </Button>
                        <Button
                            variant="contained"
                            sx={{
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: isMobile ? '0.85rem' : '1rem',
                                borderRadius: 1,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            }}
                            onClick={() => navigate('/send-otp')}
                        >
                            Ro'yxatdan o'tish
                        </Button>
                    </Stack>
                </Toolbar>
            </AppBar>

            {/* Hero Section */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    py: isMobile ? 8 : 12,
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        width: '400px',
                        height: '400px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        top: '-100px',
                        right: '-50px',
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        width: '300px',
                        height: '300px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.05)',
                        bottom: '-50px',
                        left: '-100px',
                    },
                }}
            >
                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography
                        variant={isMobile ? 'h3' : 'h2'}
                        sx={{
                            fontWeight: 800,
                            mb: 2,
                            letterSpacing: '-1px',
                            lineHeight: 1.2,
                        }}
                    >
                        Sizning Biznesni Boshqarish Uchun
                    </Typography>
                    <Typography
                        variant={isMobile ? 'h4' : 'h3'}
                        sx={{
                            fontWeight: 700,
                            mb: 3,
                            opacity: 0.95,
                        }}
                    >
                        Eng Yaxshi Platform
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: isMobile ? '1rem' : '1.1rem',
                            mb: 4,
                            opacity: 0.9,
                            maxWidth: '600px',
                            mx: 'auto',
                            lineHeight: 1.6,
                        }}
                    >
                        Marketlarni, mijozlarni, mahsulotlarni va shartnomalarni bitta joydan boshqaring. Zamonaviy va
                        kuchli admin paneli bilan vaqtingizni tejang.
                    </Typography>
                    <Stack direction={isMobile ? 'column' : 'row'} spacing={2} justifyContent="center">
                        <Button
                            variant="contained"
                            size="large"
                            sx={{
                                bgcolor: 'white',
                                color: '#667eea',
                                fontWeight: 700,
                                px: isMobile ? 3 : 4,
                                py: 1.5,
                                borderRadius: 1,
                                textTransform: 'none',
                                fontSize: '1rem',
                                '&:hover': {
                                    bgcolor: '#f0f0f0',
                                },
                            }}
                            onClick={() => navigate('/send-otp')}
                            endIcon={<ArrowForwardIcon />}
                        >
                            Boshlash
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            sx={{
                                borderColor: 'white',
                                color: 'white',
                                fontWeight: 700,
                                px: isMobile ? 3 : 4,
                                py: 1.5,
                                borderRadius: 1,
                                textTransform: 'none',
                                fontSize: '1rem',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                                    borderColor: 'white',
                                },
                            }}
                            onClick={() => navigate('/login')}
                        >
                            Kirish
                        </Button>
                    </Stack>
                </Container>
            </Box>

            {/* Features Section */}
            <Box sx={{ py: isMobile ? 8 : 12, flexGrow: 1 }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                mb: 2,
                                color: '#2c3e50',
                            }}
                        >
                            Asosiy Xususiyatlar
                        </Typography>
                        <Typography variant="body1" color="textSecondary" sx={{ fontSize: '1.1rem' }}>
                            Sizning biznesni o'stirish uchun zarur bo'lgan hamma vositalar
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                sm: 'repeat(2, 1fr)',
                                md: 'repeat(3, 1fr)',
                            },
                            gap: 3,
                            mb: 8,
                        }}
                    >
                        <FeatureItem
                            icon={<StoreIcon fontSize="inherit" />}
                            title="Marketlar"
                            description="O'zingizning e-commerce marketlarini yarating va boshqaring"
                        />
                        <FeatureItem
                            icon={<PeopleIcon fontSize="inherit" />}
                            title="Foydalanuvchilar"
                            description="Komandaning barcha a'zolarini boshqaring va rollarni belgilang"
                        />
                        <FeatureItem
                            icon={<PersonIcon fontSize="inherit" />}
                            title="Mijozlar"
                            description="Mijozlarning to'liq ma'lumotlarini saqlang va ulanishni boshqaring"
                        />
                        <FeatureItem
                            icon={<TagIcon fontSize="inherit" />}
                            title="Kategoriyalar"
                            description="Mahsulotlarni kategoriyalarga ajratib saqlang"
                        />
                        <FeatureItem
                            icon={<ShoppingBagIcon fontSize="inherit" />}
                            title="Mahsulotlar"
                            description="Barcha mahsulotlarni boshqang va inventorni kuzating"
                        />
                        <FeatureItem
                            icon={<DescriptionIcon fontSize="inherit" />}
                            title="Shartnomalar"
                            description="Biznes shartnomalarini yarating va kuzating"
                        />
                    </Box>

                    <Card
                        elevation={0}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                boxShadow: '0 12px 24px rgba(102, 126, 234, 0.2)',
                            },
                        }}
                    >
                        <CardContent sx={{ textAlign: 'center', p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, fontSize: '3rem' }}>
                                <DashboardIcon fontSize="inherit" />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                Dashboard
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Barcha ma'lumotlarini real vaqtda ko'rish, statistika va tahlillarni oling
                            </Typography>
                        </CardContent>
                    </Card>

                    {/* Stats Section */}
                    <Box
                        sx={{
                            bgcolor: 'white',
                            borderRadius: 2,
                            p: isMobile ? 4 : 6,
                            border: '1px solid #e0e0e0',
                            textAlign: 'center',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    sm: 'repeat(2, 1fr)',
                                    md: 'repeat(4, 1fr)',
                                },
                                gap: 4,
                            }}
                        >
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: '#667eea', mb: 1 }}>
                                    10+
                                </Typography>
                                <Typography color="textSecondary">Asosiy Modullar</Typography>
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: '#667eea', mb: 1 }}>
                                    100%
                                </Typography>
                                <Typography color="textSecondary">Secure & Reliable</Typography>
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: '#667eea', mb: 1 }}>
                                    24/7
                                </Typography>
                                <Typography color="textSecondary">Qo'llab-Quvvatlash</Typography>
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: '#667eea', mb: 1 }}>
                                    ∞
                                </Typography>
                                <Typography color="textSecondary">Masshtablanish</Typography>
                            </Box>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* CTA Section */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    py: isMobile ? 6 : 10,
                    textAlign: 'center',
                }}
            >
                <Container maxWidth="sm">
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                        Bugundan boshlanib qo'ying
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 4, opacity: 0.9, lineHeight: 1.6 }}>
                        Bepul ro'yxatdan o'ting va Balance platformasining barcha imkoniyatlarini foydalaning
                    </Typography>
                    <Stack direction={isMobile ? 'column' : 'row'} spacing={2} justifyContent="center">
                        <Button
                            variant="contained"
                            size="large"
                            sx={{
                                bgcolor: 'white',
                                color: '#667eea',
                                fontWeight: 700,
                                px: 4,
                                py: 1.5,
                                borderRadius: 1,
                                textTransform: 'none',
                                fontSize: '1rem',
                                '&:hover': {
                                    bgcolor: '#f0f0f0',
                                },
                            }}
                            onClick={() => navigate('/send-otp')}
                        >
                            Ro'yxatdan o'tish
                        </Button>
                    </Stack>
                </Container>
            </Box>

            {/* Footer */}
            <Box
                component="footer"
                sx={{
                    bgcolor: '#2c3e50',
                    color: 'white',
                    py: 4,
                    textAlign: 'center',
                }}
            >
                <Container maxWidth="lg">
                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                        © 2024 Balance. Barcha huquqlar zakonan himoyalangan.
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>
                        Zamonaviy admin management platform | React + TypeScript + Vite
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
}
