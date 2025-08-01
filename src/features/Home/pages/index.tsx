import { Header, ButtonComponent } from '../../../components'
import { Box, Typography } from '@mui/material'
import { CardComponent, MiniCard } from '../../../components'
import './index.css'
import { CustomCarousel } from '../../../components/Carousel'
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import theme from '../../../theme'
export const Homepage = () => {

  return (
    <div>
      <Header />
      {/* 1st portion */}
      <Box sx={{ display: 'flex', backgroundColor: "#FBFBEC", justifyContent: 'space-around', alignItems: 'center', paddingRight: "10%" }}>
        <div>
          <p className='journey'> Save Journey
          </p>
          <p className='titleGuru'>
            Make your <span style={{ color: "#FF621F" }}>travel</span> <br />Memorable
          </p>
          <p className='para'>
            TravelGuru is one of the most popular <br />Travel agency for those who want to <br />explore the wold and try to make adventure </p>
          <ButtonComponent title='Plan trip' />
        </div>
        <div >
          <img className='beardGuyImage' src="/assets/beardGuy.png" alt="homepage" />
          
        </div>
      </Box>
      {/* Things you need to do */}
      <Box sx={{ backgroundColor: theme.palette.background.default }}>
        <p style={{ textAlign: 'center', fontSize: '2rem', marginTop: '2rem', paddingTop: "1rem" }}>
          Things you need <Typography sx={{ color: theme.palette.secondary.main, fontSize: '2rem' }} component="span"  >to do</Typography>
        </p>
        <p className='ensure' >
          we ensure that you'll embark on a perfectly planned, safe vacation at a price you can afford<br />
        </p>
        <div className='cardContainer'>
          <MiniCard title='Book a flight' buttonTitle='details' location='Dubai' />
          <MiniCard title='Worth of Money' buttonTitle='details' location='Dubai' />
          <MiniCard title='Exciting travel' buttonTitle='details' location='Dubai' image='yellowLocation.svg' />
        </div>

      </Box>
      {/* popular destination */}
      <Box className='carouselMain'>
        <p className='carouselHeader'>Popular Destination</p>

        <CustomCarousel>
          <CardComponent title='Desert Safari' buttonTitle='details' location='Dubai' />
          <CardComponent title='Airport transport' buttonTitle='details' location='Dubai' />
          <CardComponent title='Abudhabi city tour' buttonTitle='details' location='Dubai' />
          <CardComponent title='Yacht' buttonTitle='details' location='Dubai'  imageUrl='/assets/desertSafari.jpg'/>
          <CardComponent title='Yacht' buttonTitle='details' location='Dubai' imageUrl='/assets/burjKhalifa.jpg' />
          <CardComponent title='Yacht' buttonTitle='details' location='Dubai' />
          <CardComponent title='Yacht' buttonTitle='details' location='Dubai' />
        </CustomCarousel>

      </Box>
      {/* Subscribe  and get exclusive offers */}
      <Box
        className='subscribe'
        sx={{
          backgroundImage: `url('/assets/Bg.svg')`,
          height: '400px',
          width: '60%'
        }}>
        <Typography className='subscribeHeader' sx={{ fontSize: '2.5rem' }}>
          Subscribe and get exclusive <br />deal & offers
        </Typography>
        <div style={{
          backgroundImage: 'url(/assets/circles.svg)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'left bottom',
          backgroundSize: 'contain', // or 'auto' depending on your design
          height: '80%',
        }}>
          <div className='subscribeInput'>
            <input placeholder='Enter your email' style={{border:'none',outline:'none'}} />
            <ButtonComponent title='Subscribe' />
          </div>

        </div>
      </Box>
      {/* Footer */}
      <Box className='footer'>
        <Box className='footerContent'>
          <div className="footer-top">
            <div className="footer-brand">
              <h2 className="logo"><span className="icon">🌍</span> Travel Guru</h2>
              <p style={{color:"#666666"}}>Book your trip in minute, get full <br /> Control for much longer.</p>
              <div className="social-icons">
                <a href="#"><FacebookIcon /></a>
                <a href="#"><TwitterIcon /></a>
                <a href="#"> <InstagramIcon /></a>
              </div>
            </div>

            <div className="footer-links">
              <div>
                <h4>Company</h4>
                <ul>
                  <li><a href="#">About</a></li>
                  <li><a href="#">Careers</a></li>
                  <li><a href="#">Logistic</a></li>
                  <li><a href="#">Privacy & Policy</a></li>
                </ul>
              </div>
              <div>
                <h4>Contact</h4>
                <ul>
                  <li><a href="#">Help/FAQ</a></li>
                  <li><a href="#">Press</a></li>
                  <li><a href="#">Affilates</a></li>
                </ul>
              </div>
              <div>
                <h4>More</h4>
                <ul>
                  <li><a href="#">Press Centre</a></li>
                  <li><a href="#">Our Blog</a></li>
                  <li><a href="#">Low fare tips</a></li>
                </ul>
              </div>
            </div>
          </div>

<hr style={{width:"80%",marginLeft:"auto",marginRight:"auto"}}/>
          <div className="footer-bottom">
            <p>Copyright, Trabook 2022. All rights reserved .</p>
            <a href="#">Terms & Conditions</a>
          </div>
        </Box>
      </Box>

    </div>
  )
}
