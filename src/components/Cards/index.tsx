import Card from "@mui/material/Card";
import { ButtonComponent } from "../Button";
import { useNavigate } from "react-router-dom";
interface Tour {
  id: number;
  name: string;
  location: string;
  description: string;
  service_image: { url: string[] };
  created_at: string;
  updated_at: string;
}
export const CardComponent = (props: {
  id: number;
  title: string;
  bookingData: Tour;
  buttonTitle: string;
  location?: string;
  imageUrl?: string;
}) => {
  const navigate = useNavigate();
  return (
    <Card sx={{ width: "auto", margin: "20px" }}>
      <img
        src={props.imageUrl ?? "/assets/yachtdubai.jpg"}
        alt="Card Image"
        style={{
          width: "100%",
          height: "220px",
          objectFit: "cover",
          objectPosition: "center",
        }}
      />
      <div style={{ padding: "16px" }}>
        <h2>{props.title}</h2>
        <p>
          This is a description of the card. It contains some brief information
          about the content of the card.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: "bold", color: "#999999" }}>
            <img src="/assets/Vector.svg" /> {props.location ?? "Dubai"}
          </span>
          <div
            style={{ display: "flex", justifyContent: "flex-end" }}
            onClick={() =>
              navigate(`/bookings/${props.id}`, { state: props.bookingData })
            }
          >
            {" "}
            <ButtonComponent title={props.buttonTitle} bgColor="red" />{" "}
          </div>
        </div>
      </div>
    </Card>
  );
};
