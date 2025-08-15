import { Box } from '@mui/material'
import { Rating } from 'react-simple-star-rating'

export const ReviewComponent = () => {
    return (
        <div>
            <Box sx={{ backgroundColor: "#F0F0F0", margin: "20px 0 20px", borderRadius: "20px", padding: "10px", width: "50%" }}>
                <Box sx={{
                    display: "flex",
                    gap: "10px"
                }}>
                    <div>
                        <img
                            src="/assets/burjKhalifa.jpg"
                            alt="Profile photo"
                            style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                                objectFit: "cover"
                            }} />
                    </div>
                    <p style={{ fontWeight: "bold" }}>
                        Kamran
                    </p>
                    <p>
                        11/12/2024
                    </p>
                </Box>
                <Box>
                    <Rating

                    /* Available Props */
                    />
                </Box>
                <Box>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </Box>
            </Box>
        </div>
    )
}
