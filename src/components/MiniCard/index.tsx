import Card from "@mui/material/Card";
import "./index.css";

export const MiniCard = (props: {
  title: string;
  buttonTitle: string;
  location?: string;
  image?: string;
}) => {
  return (
    <div>
      <Card sx={{ maxWidth: 345, margin: "20px" }}>
        <div>
          <img
            src={
              props.image ? `/assets/${props.image}` : "/assets/iconSignup.svg"
            }
            alt="Card Image"
            style={{ width: "10%", paddingLeft: "30px", paddingTop: "20px" }}
          />
          <div style={{ padding: "16px" }}>
            <h3>{props.title}</h3>
            <p>
              This is a description of the card. It contains some brief
              information about the content of the card.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
