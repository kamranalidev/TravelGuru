import { Header, ButtonComponent } from '../../../components'
import { Box, Typography } from '@mui/material'
import { CardComponent, MiniCard } from '../../../components'
import './index.css'
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
      <Box sx={{backgroundColor:"#F0F0F0"}}>
        <p style={{ textAlign: 'center', fontSize: '2rem', marginTop: '2rem',paddingTop:"1rem" }}>
          Things you need <Typography sx={{color:theme.palette.secondary.main,fontSize:'2rem'}} component="span"  >to do</Typography>
        </p>
        <p className='ensure' >
          we ensure that you'll embark on a perfectly planned, safe vacation at a price you can afford<br />
        </p>
        <div className='cardContainer'>
          <MiniCard title='Book a flight' buttonTitle='details' location='Dubai' />
          <MiniCard title='Worth of Money' buttonTitle='details' location='Dubai' />
          <MiniCard title='Exciting travel' buttonTitle='details' location='Dubai'  image='yellowLocation.svg'/>
          </div>
             
      </Box>
        <Box>
            <p style={{ textAlign: 'center', fontSize: '2rem', marginTop: '2rem'}}>Popular Destination</p>
             <div className='cardContainer'>
          <CardComponent title='Desert Safari' buttonTitle='details' location='Dubai'/>
          <CardComponent title='Airport transport' buttonTitle='details' location='Dubai'/>
          <CardComponent  title='Abudhabi city tour'buttonTitle='details' location='Dubai'/>
          <CardComponent title='Yacht' buttonTitle='details' location='Dubai'/>
        </div>
          </Box>
    </div>
  )
}
