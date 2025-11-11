import {useState,useEffect} from 'react'
import { Header, ButtonComponent,Footer } from '../../../components'
import { Box, Typography } from '@mui/material'
import { CardComponent, MiniCard } from '../../../components'
import './index.css'
import { CustomCarousel } from '../../../components/Carousel'
import theme from '../../../theme'
import { supabase } from '../../../supabaseClient'

export const Homepage = () => {
 const [trips, setTrips] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      const { data, error } = await supabase
        .from("services") // table name
        .select("*");  // select all columns
      if (error) {
        console.error("Error fetching trips:", error);
      } else {
        setTrips(data);
      }
      setLoading(false);
    };

    fetchTrips();
  }, []);
  return (
    <div>
      <Header />
      {/* 1st portion */}
      <Box sx={{ 
        display: 'flex', 
        backgroundColor: "#FBFBEC", 
        justifyContent: 'space-around', 
        alignItems: 'center', 
        padding: "4rem 10%",
        minHeight: '500px'
      }}>
        <Box sx={{ maxWidth: '500px' }}>
          <Typography 
            className='journey'
            sx={{ 
              fontFamily: 'Inter, sans-serif',
              fontSize: '1.2rem',
              fontWeight: 600,
              color: theme.palette.primary.main,
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}
          > 
            Save Journey
          </Typography>
          <Typography 
            className='titleGuru'
            sx={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '3.5rem',
              fontWeight: 700,
              color: '#333333',
              lineHeight: 1.2,
              marginBottom: '1.5rem'
            }}
          >
            Make your <span style={{ color: theme.palette.primary.main }}>travel</span> <br />Memorable
          </Typography>
          <Typography 
            className='para'
            sx={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1.2rem',
              color: '#666666',
              lineHeight: 1.6,
              marginBottom: '2rem'
            }}
          >
            TravelGuru is one of the most popular Travel agency for those who want to explore the world and try to make adventure
          </Typography>
          <ButtonComponent title='Plan trip' />
        </Box>
        <Box>
          <img className='beardGuyImage' src="/assets/beardGuy.png" alt="homepage" />
        </Box>
      </Box>
      {/* Things you need to do */}
      <Box sx={{ backgroundColor: theme.palette.background.default, padding: "3rem 2rem" }}>
        <Typography 
          sx={{ 
            textAlign: 'center', 
            fontSize: '2.5rem', 
            marginTop: '2rem', 
            paddingTop: "1rem",
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            color: '#333333'
          }}
        >
          Things you need <Typography sx={{ color: theme.palette.primary.main, fontSize: '2.5rem', fontWeight: 700 }} component="span">to do</Typography>
        </Typography>
        <Typography 
          className='ensure'
          sx={{
            fontFamily: 'Inter, sans-serif',
            textAlign: 'center',
            fontSize: '1.1rem',
            color: '#666666',
            marginTop: '1rem',
            maxWidth: '800px',
            margin: '1rem auto'
          }}
        >
          We ensure that you'll embark on a perfectly planned, safe vacation at a price you can afford
        </Typography>
        <div className='cardContainer'>
          <MiniCard title='Book a flight' buttonTitle='details' location='Dubai' />
          <MiniCard title='Worth of Money' buttonTitle='details' location='Dubai' />
          <MiniCard title='Exciting travel' buttonTitle='details' location='Dubai' image='yellowLocation.svg' />
        </div>

      </Box>
      {/* popular destination */}
      <Box className='carouselMain' sx={{ padding: "3rem 2rem" }}>
        <Typography 
          className='carouselHeader'
          sx={{
            fontFamily: 'Inter, sans-serif',
            textAlign: 'left',
            fontSize: '3rem',
            fontWeight: 700,
            color: '#333333',
            marginBottom: '2rem'
          }}
        >
          Popular Destination
        </Typography>

        <CustomCarousel>
          {trips.length > 0 ? (
            trips.map((trip: any) => (
              <CardComponent
                key={trip.id}
                bookingData ={trip}
                id = {trip.id}
                title={trip.service_name}
                buttonTitle='details' 
                location={trip.location}
                 imageUrl={trip.service_image?.url[0] || null}
              />
            ))
          ) : (
            <p>Loading trips...</p>
          )}
          {/* <CardComponent title='Desert Safari' buttonTitle='details' location='Dubai' />
          <CardComponent title='Airport transport' buttonTitle='details' location='Dubai' />
          <CardComponent title='Abudhabi city tour' buttonTitle='details' location='Dubai' />
          <CardComponent title='Yacht' buttonTitle='details' location='Dubai' imageUrl='/assets/desertSafari.jpg' />
          <CardComponent title='Yacht' buttonTitle='details' location='Dubai' imageUrl='/assets/burjKhalifa.jpg' />
          <CardComponent title='Yacht' buttonTitle='details' location='Dubai' />
          <CardComponent title='Yacht' buttonTitle='details' location='Dubai' /> */}
        </CustomCarousel>

      </Box>
      {/* Subscribe  and get exclusive offers */}
      <Box
        className='subscribe'
        sx={{
          backgroundImage: `url('/assets/Bg.svg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '400px',
          width: '90%',
          maxWidth: '1200px',
          margin: '3rem auto',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
        <Typography 
          className='subscribeHeader' 
          sx={{ 
            fontSize: '2.5rem',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            color: 'white',
            textAlign: 'center',
            marginBottom: '2rem',
            zIndex: 2
          }}
        >
          Subscribe and get exclusive <br />deal & offers
        </Typography>
        <Box sx={{
          backgroundImage: 'url(/assets/circles.svg)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'left bottom',
          backgroundSize: 'contain',
          height: '80%',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          <Box className='subscribeInput' sx={{
            backgroundColor: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '50%',
            maxWidth: '500px',
            height: '60px',
            borderRadius: '12px',
            padding: '0 8px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
          }}>
            <input 
              placeholder='Enter your email' 
              style={{ 
                border: 'none', 
                outline: 'none',
                flex: 1,
                padding: '0 16px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '1rem'
              }} 
            />
            <ButtonComponent title='Subscribe' width='35%' />
          </Box>
        </Box>
      </Box>
      {/* Footer */}
     <Footer />

    </div>
  )
}
