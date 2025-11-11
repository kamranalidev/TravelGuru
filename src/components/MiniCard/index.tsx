import Card from '@mui/material/Card';
import { ButtonComponent } from '../Button';
import theme from '../../theme';

export const MiniCard = (props: { title: string, buttonTitle: string, location?: string, image?: string }) => {
    return (
        <Card sx={{ 
            maxWidth: 320, 
            margin: '10px',
            borderRadius: '12px',
            padding: '24px',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(255, 98, 31, 0.15)',
            }
        }}>
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'flex-start'
            }}>
                <img 
                    src={props.image ? `/assets/${props.image}` : '/assets/iconSignup.svg'} 
                    alt="Card Icon" 
                    style={{ 
                        width: '48px', 
                        height: '48px',
                        marginBottom: '16px'
                    }} 
                />
                <div style={{ width: '100%' }}>
                    <h3 style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        color: '#333333',
                        marginBottom: '12px',
                        marginTop: 0
                    }}>
                        {props.title}
                    </h3>
                    <p style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.95rem',
                        color: '#666666',
                        lineHeight: 1.6,
                        marginBottom: '20px'
                    }}>
                        Experience world-class service and create unforgettable memories with our curated travel experiences.
                    </p>
                    {props.location && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginBottom: '16px',
                            color: '#666666',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '0.9rem'
                        }}>
                            <img src='/assets/Vector.svg' alt="location" style={{ width: '16px', height: '16px' }} />
                            {props.location}
                        </div>
                    )}
                    <ButtonComponent title={props.buttonTitle} />
                </div>
            </div>
        </Card>
    )
}
