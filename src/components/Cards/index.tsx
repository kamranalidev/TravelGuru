import Card from '@mui/material/Card';
import { ButtonComponent } from '../Button';
import { useNavigate } from 'react-router-dom';
import theme from '../../theme';

interface Tour {
  id: number;
  name: string;
  location: string;
  description: string;
  service_image: {url:string[]}; // array of image URLs
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export const CardComponent = (props:{id:number,title:string,bookingData:Tour,buttonTitle:string,location?:string,imageUrl?:string}) => {
  const navigate = useNavigate();
  return (
        <Card sx={{ 
          width: "auto", 
          margin: '20px',
          maxWidth: '350px',
          borderRadius: '12px',
          overflow: 'hidden',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          }
        }}>
          <img 
            src={props.imageUrl??"/assets/yachtdubai.jpg"} 
            alt="Card Image" 
            style={{ 
              width: '100%', 
              height: '200px',
              objectFit: 'cover'
            }} 
          />
          <div style={{ padding: '20px' }}>
            <h2 style={{ 
              fontFamily: 'Inter, sans-serif',
              fontSize: '1.5rem',
              fontWeight: 600,
              color: '#333333',
              marginBottom: '12px',
              marginTop: 0
            }}>
              {props.title}
            </h2>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.95rem',
              color: '#666666',
              lineHeight: 1.6,
              marginBottom: '16px'
            }}>
              Discover amazing destinations and create unforgettable memories with our expertly curated travel experiences.
            </p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: '20px'
            }}>
                <span style={{ 
                  fontWeight: 500, 
                  color: '#666666',
                  fontFamily: 'Inter, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.9rem'
                }}>
                 <img src='/assets/Vector.svg' alt="location" style={{ width: '16px', height: '16px' }} />   
                 {props.location ?? 'Dubai'}
                </span>
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'flex-end',
                cursor: 'pointer'
              }}
              onClick={()=>navigate(`/bookings/${props.id}`,{state:props.bookingData})}
            > 
              <ButtonComponent title={props.buttonTitle} /> 
            </div>           
            </div>
          </div>        
        </Card>
  )
}
