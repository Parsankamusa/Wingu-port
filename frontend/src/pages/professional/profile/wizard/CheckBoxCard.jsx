import { Box, Card } from '@mui/material'
import React from 'react'

const CheckBoxCard = ({children}) => {
  return (
    <Box sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        }}>
        {children}
    </Box>
  )
}

export default CheckBoxCard