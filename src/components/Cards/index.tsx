import Card from '@mui/material/Card';
import { ButtonComponent } from '../Button';
export const CardComponent = (props:{title:string,buttonTitle:string,location?:string,imageUrl?:string}) => {
  return (
  
        <Card sx={{ width:"auto", margin: '20px' }}>
          <img src={props.imageUrl??"/assets/yachtdubai.jpg"} alt="Card Image" style={{ width: '100%' }} />
          <div style={{ padding: '16px' }}>
            <h2>{props.title}</h2>
            <p>This is a description of the card. It contains some brief information about the content of the card.</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: '#999999' }}>
                 <img src='/assets/Vector.svg' />   {props.location ?? 'Dubai'}
                </span>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}> <ButtonComponent title={props.buttonTitle} bgColor='red' /> </div>           

            </div>
          </div>        
        </Card>
    
  )
}
